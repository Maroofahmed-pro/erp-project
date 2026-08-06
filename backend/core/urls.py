from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, InventoryViewSet, PurchaseViewSet, LedgerViewSet, ExpenseViewSet, UserViewSet, VendorViewSet, VendorDailyEntryViewSet, VendorDailyExpenseViewSet, VendorPaymentViewSet, dashboard, me

router = DefaultRouter()
router.register("clients", ClientViewSet)
router.register("inventory", InventoryViewSet)
router.register("purchases", PurchaseViewSet)
router.register("ledger", LedgerViewSet)
router.register("expenses", ExpenseViewSet)
router.register("users", UserViewSet)
router.register("vendors", VendorViewSet)
router.register("vendor-entries", VendorDailyEntryViewSet)
router.register("vendor-daily-expenses", VendorDailyExpenseViewSet)
router.register("vendor-payments", VendorPaymentViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", dashboard),
    path("me/", me),
]
