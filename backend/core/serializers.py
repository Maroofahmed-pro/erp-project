from rest_framework import serializers
from django.db import transaction
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

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = "__all__"

class PurchaseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseItem
        exclude = ["purchase"]
        read_only_fields = ["total"]

class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)
    client_name = serializers.CharField(source="client.name", read_only=True)
    class Meta:
        model = Purchase
        fields = "__all__"
        read_only_fields = ["grand_total","created_by"]

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
            if inv:
                if inv.current_stock < item["quantity"]:
                    raise serializers.ValidationError({
                        "items": f"Insufficient stock for {inv.name}. Available: {inv.current_stock} {inv.unit}."
                    })
                inv.current_stock -= item["quantity"]
                inv.save(update_fields=["current_stock"])
        purchase.grand_total = total
        purchase.save(update_fields=["grand_total"])
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

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ["created_by"]
