from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Client, InventoryItem, Purchase, PurchaseItem, LedgerEntry, Expense, Vendor, VendorDailyEntry, VendorDailyExpense, VendorPayment

admin.site.register(User, UserAdmin)
admin.site.register(Client)
admin.site.register(InventoryItem)
admin.site.register(Purchase)
admin.site.register(PurchaseItem)
admin.site.register(LedgerEntry)
admin.site.register(Expense)
admin.site.register(Vendor)
admin.site.register(VendorDailyEntry)
admin.site.register(VendorPayment)
admin.site.register(VendorDailyExpense)
