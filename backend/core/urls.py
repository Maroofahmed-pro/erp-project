from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, InventoryViewSet, PurchaseViewSet, LedgerViewSet, ExpenseViewSet, UserViewSet, dashboard, me

router = DefaultRouter()
router.register("clients", ClientViewSet)
router.register("inventory", InventoryViewSet)
router.register("purchases", PurchaseViewSet)
router.register("ledger", LedgerViewSet)
router.register("expenses", ExpenseViewSet)
router.register("users", UserViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", dashboard),
    path("me/", me),
]
