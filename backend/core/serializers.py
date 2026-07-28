from rest_framework import serializers
from django.db import transaction
from django.db.models import Sum
from django.utils.timezone import localdate
from decimal import Decimal
from .models import Client, InventoryItem, Purchase, PurchaseItem, LedgerEntry, Expense, User

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
