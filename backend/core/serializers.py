from rest_framework import serializers
from django.db import transaction
from django.db.models import Sum
from django.utils.timezone import localdate
from decimal import Decimal, ROUND_HALF_UP
from .models import Client, InventoryItem, Purchase, PurchaseItem, LedgerEntry, Expense, User, Vendor, VendorDailyEntry, VendorDailyExpense, VendorPayment

def refresh_vendor_daily_expense(vendor, expense_date):
    expense = VendorDailyExpense.objects.filter(vendor=vendor, expense_date=expense_date).first()
    if not expense:
        return
    total = vendor.daily_entries.filter(entry_date=expense_date).aggregate(v=Sum("vendor_amount"))["v"] or Decimal("0")
    commission = (total * expense.commission_percentage / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    other = expense.freight + expense.labor + expense.cash + expense.previous + expense.market_fee
    expense.total_amount = total
    expense.commission_amount = commission
    expense.total_deductions = commission + other
    expense.final_amount = total - expense.total_deductions
    expense.save(update_fields=["total_amount", "commission_amount", "total_deductions", "final_amount", "updated_at"])

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id","username","first_name","last_name","email","phone","role","language"]

class ClientSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    class Meta:
        model = Client
        fields = "__all__"
        extra_kwargs = {
            "opening_balance": {"min_value": Decimal("0")},
            "credit_limit": {"min_value": Decimal("0")},
        }

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = "__all__"
        extra_kwargs = {
            "current_stock": {"min_value": Decimal("0")},
            "minimum_stock": {"min_value": Decimal("0")},
            "purchase_rate": {"min_value": Decimal("0")},
        }

class PurchaseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseItem
        exclude = ["purchase"]
        read_only_fields = ["total"]
        extra_kwargs = {
            "rate": {"min_value": Decimal("0.01")},
            "quantity": {"min_value": Decimal("0.01")},
        }

class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)
    client_name = serializers.CharField(source="client.name", read_only=True)
    class Meta:
        model = Purchase
        fields = "__all__"
        read_only_fields = ["grand_total","created_by"]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Add at least one purchase item.")
        return value

    def validate(self, attrs):
        purchase_date = attrs.get("purchase_date", getattr(self.instance, "purchase_date", None))
        if purchase_date and purchase_date > localdate():
            raise serializers.ValidationError({"purchase_date": "Future purchases are not allowed."})
        if self.instance:
            if "status" in attrs and attrs["status"] != self.instance.status:
                raise serializers.ValidationError({"status": "Posted purchase status cannot be changed."})
            if "items" in attrs:
                raise serializers.ValidationError({"items": "Posted purchase items cannot be changed."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data.pop("items")
        purchase = Purchase.objects.create(created_by=self.context["request"].user, **validated_data)
        total = 0
        for item in items:
            line_total = item["rate"] * item["quantity"]
            total += line_total
            PurchaseItem.objects.create(purchase=purchase, total=line_total, **item)
            inv = item.get("inventory_item")
            if inv and purchase.status == "completed":
                if inv.current_stock < item["quantity"]:
                    raise serializers.ValidationError({
                        "items": f"Insufficient stock for {inv.name}. Available: {inv.current_stock} {inv.unit}."
                    })
                inv.current_stock -= item["quantity"]
                inv.save(update_fields=["current_stock"])
        purchase.grand_total = total
        purchase.save(update_fields=["grand_total"])
        if purchase.status == "completed":
            LedgerEntry.objects.create(
                client=purchase.client, entry_type="purchase", amount=total,
                description=f"Purchase #{purchase.id}", entry_date=purchase.purchase_date,
                purchase=purchase, created_by=self.context["request"].user
            )
        return purchase

class LedgerEntrySerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    class Meta:
        model = LedgerEntry
        fields = "__all__"
        read_only_fields = ["created_by"]

    def validate(self, attrs):
        entry_type = attrs.get("entry_type", getattr(self.instance, "entry_type", None))
        amount = attrs.get("amount", getattr(self.instance, "amount", None))
        entry_date = attrs.get("entry_date", getattr(self.instance, "entry_date", None))
        if entry_date and entry_date > localdate():
            raise serializers.ValidationError({"entry_date": "Future ledger entries are not allowed."})
        if amount == 0:
            raise serializers.ValidationError({"amount": "Amount cannot be zero."})
        if entry_type == "credit" and amount is not None and amount > 0:
            raise serializers.ValidationError({"amount": "Recovery credits must be negative."})
        if entry_type in {"debit", "purchase"} and amount is not None and amount < 0:
            raise serializers.ValidationError({"amount": "Debit and purchase amounts must be positive."})
        if entry_type == "credit" and amount is not None:
            client = attrs.get("client", getattr(self.instance, "client", None))
            entry_date = attrs.get("entry_date", getattr(self.instance, "entry_date", None))
            if client and entry_date:
                entries = client.ledger_entries.filter(entry_date__lte=entry_date)
                if self.instance:
                    entries = entries.exclude(pk=self.instance.pk)
                balance = client.opening_balance + (entries.aggregate(v=Sum("amount"))["v"] or Decimal("0"))
                if abs(amount) > max(balance, Decimal("0")):
                    raise serializers.ValidationError({"amount": "Payment cannot exceed the outstanding balance."})
        return attrs

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ["created_by"]
        extra_kwargs = {"amount": {"min_value": Decimal("0.01")}}

    def validate_expense_date(self, value):
        if value > localdate():
            raise serializers.ValidationError("Future expenses are not allowed.")
        return value

class VendorSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    total_received = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    class Meta:
        model = Vendor
        fields = "__all__"
        extra_kwargs = {"opening_balance": {"min_value": Decimal("0")}}
    def get_total_received(self, obj):
        return obj.daily_entries.aggregate(v=Sum("vendor_amount"))["v"] or Decimal("0")
    def get_total_paid(self, obj):
        return obj.payments.aggregate(v=Sum("amount"))["v"] or Decimal("0")

class VendorDailyEntrySerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    amount = serializers.DecimalField(max_digits=14, decimal_places=2, write_only=True, required=False, min_value=Decimal("0.01"))
    class Meta:
        model = VendorDailyEntry
        fields = "__all__"
        read_only_fields = ["gross_amount","vendor_amount","created_by"]
        extra_kwargs = {
            "quantity": {"min_value": Decimal("0.01")},
            "rate": {"min_value": Decimal("0")},
            "margin": {"min_value": Decimal("0")},
            "deductions": {"min_value": Decimal("0")},
        }
    def validate_entry_date(self, value):
        if value > localdate():
            raise serializers.ValidationError("Future entries are not allowed.")
        return value
    def validate(self, attrs):
        gross = attrs.get("amount", attrs.get("quantity", Decimal("0")) * attrs.get("rate", Decimal("0")))
        if attrs.get("margin", Decimal("0")) + attrs.get("deductions", Decimal("0")) > gross:
            raise serializers.ValidationError("Margin and deductions cannot exceed the gross amount.")
        return attrs
    def create(self, validated_data):
        gross = validated_data.pop("amount", None) or validated_data["quantity"] * validated_data["rate"]
        validated_data["gross_amount"] = gross
        validated_data["vendor_amount"] = gross - validated_data.get("margin", Decimal("0")) - validated_data.get("deductions", Decimal("0"))
        instance = super().create(validated_data)
        refresh_vendor_daily_expense(instance.vendor, instance.entry_date)
        return instance
    def update(self, instance, validated_data):
        previous_vendor, previous_date = instance.vendor, instance.entry_date
        quantity = validated_data.get("quantity", instance.quantity)
        rate = validated_data.get("rate", instance.rate)
        margin = validated_data.get("margin", instance.margin)
        deductions = validated_data.get("deductions", instance.deductions)
        gross = validated_data.pop("amount", None) or quantity * rate
        validated_data["gross_amount"] = gross
        validated_data["vendor_amount"] = gross - margin - deductions
        instance = super().update(instance, validated_data)
        refresh_vendor_daily_expense(previous_vendor, previous_date)
        if instance.vendor_id != previous_vendor.id or instance.entry_date != previous_date:
            refresh_vendor_daily_expense(instance.vendor, instance.entry_date)
        return instance

class VendorDailyExpenseSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    class Meta:
        model = VendorDailyExpense
        fields = "__all__"
        read_only_fields = ["commission_amount", "total_amount", "total_deductions", "final_amount", "created_by"]
        extra_kwargs = {
            "commission_percentage": {"min_value": Decimal("0"), "max_value": Decimal("100")},
            "freight": {"min_value": Decimal("0")},
            "labor": {"min_value": Decimal("0")},
            "cash": {"min_value": Decimal("0")},
            "previous": {"min_value": Decimal("0")},
            "market_fee": {"min_value": Decimal("0")},
        }
    def validate_expense_date(self, value):
        if value > localdate():
            raise serializers.ValidationError("Future expenses are not allowed.")
        return value
    def validate(self, attrs):
        vendor = attrs.get("vendor", getattr(self.instance, "vendor", None))
        expense_date = attrs.get("expense_date", getattr(self.instance, "expense_date", None))
        total = vendor.daily_entries.filter(entry_date=expense_date).aggregate(v=Sum("vendor_amount"))["v"] or Decimal("0")
        percentage = attrs.get("commission_percentage", getattr(self.instance, "commission_percentage", Decimal("0")))
        commission = (total * percentage / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        other = sum((
            attrs.get("freight", getattr(self.instance, "freight", Decimal("0"))),
            attrs.get("labor", getattr(self.instance, "labor", Decimal("0"))),
            attrs.get("cash", getattr(self.instance, "cash", Decimal("0"))),
            attrs.get("previous", getattr(self.instance, "previous", Decimal("0"))),
            attrs.get("market_fee", getattr(self.instance, "market_fee", Decimal("0"))),
        ), Decimal("0"))
        deductions = commission + other
        if total <= 0:
            raise serializers.ValidationError("Add transactions for this business date before adding expenses.")
        if deductions > total:
            raise serializers.ValidationError("Total expenses cannot exceed the day's total amount.")
        attrs["total_amount"] = total
        attrs["commission_amount"] = commission
        attrs["total_deductions"] = deductions
        attrs["final_amount"] = total - deductions
        return attrs

class VendorPaymentSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    class Meta:
        model = VendorPayment
        fields = "__all__"
        read_only_fields = ["created_by", "commission_amount"]
        extra_kwargs = {
            "amount": {"min_value": Decimal("0.01")},
            "total_amount": {"min_value": Decimal("0")},
            "kiraya": {"min_value": Decimal("0")},
            "mazdori": {"min_value": Decimal("0")},
            "commission_percentage": {"min_value": Decimal("0"), "max_value": Decimal("100")},
        }
    def validate_payment_date(self, value):
        if value > localdate():
            raise serializers.ValidationError("Future payments are not allowed.")
        return value
    def validate(self, attrs):
        vendor = attrs.get("vendor", getattr(self.instance, "vendor", None))
        total = attrs.get("total_amount", getattr(self.instance, "total_amount", Decimal("0")))
        kiraya = attrs.get("kiraya", getattr(self.instance, "kiraya", Decimal("0")))
        mazdori = attrs.get("mazdori", getattr(self.instance, "mazdori", Decimal("0")))
        percentage = attrs.get("commission_percentage", getattr(self.instance, "commission_percentage", Decimal("0")))
        if total:
            commission = (total * percentage / Decimal("100") / Decimal("10")).quantize(
                Decimal("1"), rounding=ROUND_HALF_UP
            ) * Decimal("10")
            amount = total - kiraya - mazdori - commission
            if amount <= 0:
                raise serializers.ValidationError("Total deductions must be less than the total amount.")
            attrs["commission_amount"] = commission
            attrs["amount"] = amount
        else:
            amount = attrs.get("amount", getattr(self.instance, "amount", Decimal("0")))
        available = vendor.balance + (self.instance.amount if self.instance else Decimal("0")) if vendor else Decimal("0")
        if vendor and amount > available:
            raise serializers.ValidationError({"amount": "Payment cannot exceed the vendor balance."})
        return attrs
