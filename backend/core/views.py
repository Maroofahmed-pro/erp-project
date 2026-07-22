from django.db.models import Sum
from django.utils.timezone import localdate
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Client, InventoryItem, Purchase, LedgerEntry, Expense, User
from .serializers import (
    ClientSerializer, InventoryItemSerializer, PurchaseSerializer,
    LedgerEntrySerializer, ExpenseSerializer, UserSerializer
)

class BaseModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

class ClientViewSet(BaseModelViewSet):
    queryset = Client.objects.all().order_by("name")
    serializer_class = ClientSerializer
    search_fields = ["name","phone"]

class InventoryViewSet(BaseModelViewSet):
    queryset = InventoryItem.objects.all().order_by("name")
    serializer_class = InventoryItemSerializer

class PurchaseViewSet(BaseModelViewSet):
    queryset = Purchase.objects.select_related("client").prefetch_related("items").all().order_by("-purchase_date","-id")
    serializer_class = PurchaseSerializer

class LedgerViewSet(BaseModelViewSet):
    queryset = LedgerEntry.objects.select_related("client").all().order_by("-entry_date","-id")
    serializer_class = LedgerEntrySerializer
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ExpenseViewSet(BaseModelViewSet):
    queryset = Expense.objects.all().order_by("-expense_date","-id")
    serializer_class = ExpenseSerializer
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserSerializer

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard(request):
    today = localdate()
    purchases = Purchase.objects.filter(purchase_date=today, status="completed").aggregate(v=Sum("grand_total"))["v"] or 0
    credits = LedgerEntry.objects.filter(entry_date=today, entry_type="credit").aggregate(v=Sum("amount"))["v"] or 0
    expenses = Expense.objects.filter(expense_date=today).aggregate(v=Sum("amount"))["v"] or 0
    clients = Client.objects.filter(is_active=True).count()
    low_stock = InventoryItem.objects.filter(current_stock__lte=models.F("minimum_stock")).count() if False else 0
    return Response({
        "today_purchase": purchases,
        "today_recovery": abs(credits),
        "today_expenses": expenses,
        "clients": clients,
        "cash_in_hand": abs(credits) - expenses,
        "low_stock": low_stock,
    })
