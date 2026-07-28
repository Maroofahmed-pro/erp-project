from datetime import date, timedelta
from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Client, Expense, InventoryItem, LedgerEntry, Purchase, User


class ERPApiEndToEndTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="StrongPass123!")
        response = self.client.post("/api/auth/login/", {"username": "tester", "password": "StrongPass123!"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        self.client_record = Client.objects.create(
            name="Test Buyer", phone="03000000000", opening_balance=Decimal("1000"),
            credit_limit=Decimal("50000"),
        )
        self.item = InventoryItem.objects.create(
            name="Test Tomato", unit="kg", current_stock=Decimal("100"),
            minimum_stock=Decimal("20"), purchase_rate=Decimal("50"),
        )

    def purchase_payload(self, **overrides):
        payload = {
            "client": self.client_record.id,
            "purchase_date": date.today().isoformat(),
            "reference_number": "TEST-001",
            "status": "completed",
            "items": [{
                "inventory_item": self.item.id,
                "item_name": self.item.name,
                "unit": "kg",
                "rate": "75",
                "quantity": "10",
            }],
        }
        payload.update(overrides)
        return payload

    def test_authentication_is_required(self):
        self.client.credentials()
        self.assertEqual(self.client.get("/api/clients/").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_completed_purchase_updates_stock_and_ledger(self):
        response = self.client.post("/api/purchases/", self.purchase_payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.item.refresh_from_db()
        self.assertEqual(self.item.current_stock, Decimal("90"))
        entry = LedgerEntry.objects.get(purchase_id=response.data["id"])
        self.assertEqual(entry.amount, Decimal("750"))

    def test_purchase_rejects_empty_items(self):
        response = self.client.post("/api/purchases/", self.purchase_payload(items=[]), format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_purchase_rejects_negative_and_zero_values(self):
        for field, value in (("quantity", "-5"), ("quantity", "0"), ("rate", "-1"), ("rate", "0")):
            payload = self.purchase_payload()
            payload["items"][0][field] = value
            response = self.client.post("/api/purchases/", payload, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, (field, value, response.data))
        self.item.refresh_from_db()
        self.assertEqual(self.item.current_stock, Decimal("100"))

    def test_purchase_rejects_insufficient_stock_without_partial_writes(self):
        payload = self.purchase_payload()
        payload["items"][0]["quantity"] = "101"
        response = self.client.post("/api/purchases/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Purchase.objects.exists())
        self.assertFalse(LedgerEntry.objects.exists())

    def test_cancelled_purchase_does_not_change_stock_or_ledger(self):
        response = self.client.post("/api/purchases/", self.purchase_payload(status="cancelled"), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.item.refresh_from_db()
        self.assertEqual(self.item.current_stock, Decimal("100"))
        self.assertFalse(LedgerEntry.objects.exists())

    def test_negative_financial_and_stock_values_are_rejected(self):
        cases = [
            ("/api/inventory/", {"name": "Bad Stock", "current_stock": "-1", "minimum_stock": "0", "purchase_rate": "1"}),
            ("/api/expenses/", {"category": "Fuel", "title": "Bad Expense", "amount": "-100", "expense_date": date.today().isoformat()}),
            ("/api/clients/", {"name": "Bad Client", "opening_balance": "-1", "credit_limit": "-1"}),
        ]
        for url, payload in cases:
            response = self.client.post(url, payload, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, (url, response.data))

    def test_recovery_sign_and_zero_are_validated(self):
        base = {"client": self.client_record.id, "entry_type": "credit", "entry_date": date.today().isoformat()}
        for amount in ("100", "0"):
            response = self.client.post("/api/ledger/", {**base, "amount": amount}, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)
        response = self.client.post("/api/ledger/", {**base, "amount": "-500"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_recovery_cannot_exceed_balance_on_entry_date(self):
        base = {"client": self.client_record.id, "entry_type": "credit", "entry_date": date.today().isoformat()}
        response = self.client.post("/api/ledger/", {**base, "amount": "-1001"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(LedgerEntry.objects.exists())

    def test_posted_purchase_cannot_be_reclassified(self):
        response = self.client.post("/api/purchases/", self.purchase_payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        purchase_id = response.data["id"]
        response = self.client.patch(f"/api/purchases/{purchase_id}/", {"status": "cancelled"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.item.refresh_from_db()
        self.assertEqual(self.item.current_stock, Decimal("90"))
        self.assertTrue(LedgerEntry.objects.filter(purchase_id=purchase_id).exists())

    def test_future_business_dates_are_rejected(self):
        future = (date.today() + timedelta(days=1)).isoformat()
        purchase = self.client.post(
            "/api/purchases/", self.purchase_payload(purchase_date=future), format="json"
        )
        recovery = self.client.post("/api/ledger/", {
            "client": self.client_record.id, "entry_type": "credit",
            "amount": "-100", "entry_date": future,
        }, format="json")
        expense = self.client.post("/api/expenses/", {
            "category": "Fuel", "title": "Future fuel",
            "amount": "100", "expense_date": future,
        }, format="json")
        self.assertEqual(purchase.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(recovery.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(expense.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dashboard_reports_low_stock_and_cash(self):
        self.item.current_stock = Decimal("10")
        self.item.save(update_fields=["current_stock"])
        Expense.objects.create(category="Fuel", title="Fuel", amount=Decimal("100"), expense_date=date.today())
        LedgerEntry.objects.create(
            client=self.client_record, entry_type="credit", amount=Decimal("-500"), entry_date=date.today()
        )
        response = self.client.get("/api/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["low_stock"], 1)
        self.assertEqual(Decimal(str(response.data["cash_in_hand"])), Decimal("400"))

    def test_deleting_client_with_purchase_returns_validation_error(self):
        response = self.client.post("/api/purchases/", self.purchase_payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.delete(f"/api/clients/{self.client_record.id}/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Client.objects.filter(id=self.client_record.id).exists())
