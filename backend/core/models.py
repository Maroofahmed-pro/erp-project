from decimal import Decimal
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class User(AbstractUser):
    ROLE_CHOICES = [
        ("super_admin", "Super Admin"), ("admin", "Admin"), ("manager", "Manager"),
        ("cashier", "Cashier"), ("accountant", "Accountant"),
    ]
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default="cashier")
    phone = models.CharField(max_length=30, blank=True)
    language = models.CharField(max_length=5, choices=[("en","English"),("ur","Urdu")], default="en")

class Client(TimeStampedModel):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    opening_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    credit_limit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    def __str__(self): return self.name
    @property
    def balance(self):
        total = self.ledger_entries.aggregate(v=models.Sum("amount"))["v"] or Decimal("0")
        return self.opening_balance + total

class InventoryItem(TimeStampedModel):
    name = models.CharField(max_length=150)
    name_ur = models.CharField(max_length=150, blank=True)
    category = models.CharField(max_length=100, blank=True)
    unit = models.CharField(max_length=30, default="kg")
    current_stock = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    minimum_stock = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    purchase_rate = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    def __str__(self): return self.name

class Purchase(TimeStampedModel):
    STATUS_CHOICES = [("draft","Draft"),("completed","Completed"),("cancelled","Cancelled")]
    client = models.ForeignKey(Client, related_name="purchases", on_delete=models.PROTECT)
    purchase_date = models.DateField()
    reference_number = models.CharField(max_length=80, blank=True)
    vehicle_number = models.CharField(max_length=80, blank=True)
    grand_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="completed")
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)

class PurchaseItem(TimeStampedModel):
    purchase = models.ForeignKey(Purchase, related_name="items", on_delete=models.CASCADE)
    inventory_item = models.ForeignKey(InventoryItem, null=True, blank=True, on_delete=models.SET_NULL)
    item_name = models.CharField(max_length=150)
    unit = models.CharField(max_length=30, default="kg")
    rate = models.DecimalField(max_digits=14, decimal_places=2)
    quantity = models.DecimalField(max_digits=14, decimal_places=2)
    total = models.DecimalField(max_digits=14, decimal_places=2)

class LedgerEntry(TimeStampedModel):
    TYPES = [("debit","Debit"),("credit","Credit"),("purchase","Purchase"),("adjustment","Adjustment")]
    client = models.ForeignKey(Client, related_name="ledger_entries", on_delete=models.CASCADE)
    entry_type = models.CharField(max_length=20, choices=TYPES)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    entry_date = models.DateField()
    purchase = models.ForeignKey(Purchase, null=True, blank=True, on_delete=models.SET_NULL)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)

class Expense(TimeStampedModel):
    category = models.CharField(max_length=100)
    title = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    expense_date = models.DateField()
    paid_to = models.CharField(max_length=150, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
