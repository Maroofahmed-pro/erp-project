import calendar
import random
from datetime import date
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Client, Expense, InventoryItem, LedgerEntry, Purchase, PurchaseItem, User


class Command(BaseCommand):
    help = "Create a coherent, repeatable month of demo ERP activity."

    def add_arguments(self, parser):
        parser.add_argument("--month", default=date.today().strftime("%Y-%m"), help="Month in YYYY-MM format")

    @transaction.atomic
    def handle(self, *args, **options):
        try:
            year, month = map(int, options["month"].split("-"))
            month_start = date(year, month, 1)
            month_end = date(year, month, calendar.monthrange(year, month)[1])
        except (TypeError, ValueError):
            raise CommandError("--month must use YYYY-MM, for example 2026-07")
        today = date.today()
        if month_start > today:
            raise CommandError("Cannot create demo transactions in a future month.")
        last_day = today.day if (year, month) == (today.year, today.month) else month_end.day

        rng = random.Random(year * 100 + month)
        marker = f"DEMO-{year}{month:02d}"
        user = User.objects.filter(is_superuser=True).first() or User.objects.first()

        # Reruns replace this demo month only.
        Purchase.objects.filter(reference_number__startswith=marker).delete()
        LedgerEntry.objects.filter(description__startswith=marker).delete()
        Expense.objects.filter(notes__startswith=marker).delete()

        client_specs = [
            ("Ahmed Traders", "احمد ٹریڈرز", "0301-1101001", "Sabzi Mandi Gate 1", 35000),
            ("Al Madina Vegetables", "المدینہ سبزی فروش", "0302-2202002", "Saddar Bazaar", 18000),
            ("Bismillah Store", "بسم اللہ اسٹور", "0303-3303003", "Jinnah Road", 12000),
            ("Faisal Fresh Mart", "فیصل فریش مارٹ", "0304-4404004", "Satellite Town", 27000),
            ("Karachi Vegetable House", "کراچی ویجیٹیبل ہاؤس", "0305-5505005", "New Town", 42000),
            ("Madina Cash & Carry", "مدینہ کیش اینڈ کیری", "0306-6606006", "Main Bazaar", 9000),
            ("New Punjab Traders", "نیو پنجاب ٹریڈرز", "0307-7707007", "Railway Road", 31000),
            ("Rehman General Store", "رحمان جنرل اسٹور", "0308-8808008", "College Road", 15000),
            ("Saeed Vegetable Shop", "سعید سبزی شاپ", "0309-9909009", "Model Colony", 22000),
            ("Usman Brothers", "عثمان برادرز", "0310-1010110", "Mandi Road", 29000),
            ("Zam Zam Foods", "زم زم فوڈز", "0311-1212111", "Commercial Market", 16000),
            ("City Fresh Point", "سٹی فریش پوائنٹ", "0312-1313112", "Airport Road", 24000),
        ]
        clients = []
        for name, name_ur, phone, address, opening in client_specs:
            client, _ = Client.objects.update_or_create(
                phone=phone,
                defaults={
                    "name": name, "name_ur": name_ur, "address": address,
                    "opening_balance": Decimal(opening), "credit_limit": Decimal("250000"),
                    "is_active": True, "notes": f"{marker} demo buyer",
                },
            )
            clients.append(client)

        item_specs = [
            ("Fresh Tomato", "تازہ ٹماٹر", "Vegetables", 1800, 3500, 95),
            ("Red Potato", "سرخ آلو", "Vegetables", 2500, 4800, 72),
            ("Onion", "پیاز", "Vegetables", 2200, 4400, 88),
            ("Green Chilli", "ہری مرچ", "Vegetables", 350, 900, 210),
            ("Cucumber", "کھیرا", "Vegetables", 700, 1700, 82),
            ("Cauliflower", "پھول گوبھی", "Vegetables", 650, 1500, 105),
            ("Cabbage", "بند گوبھی", "Vegetables", 600, 1450, 78),
            ("Garlic", "لہسن", "Vegetables", 300, 780, 390),
            ("Ginger", "ادرک", "Vegetables", 280, 720, 430),
            ("Lemon", "لیموں", "Fruit", 450, 1100, 175),
        ]
        items = []
        for name, name_ur, category, minimum, stock, rate in item_specs:
            item, _ = InventoryItem.objects.update_or_create(
                name=name,
                defaults={
                    "name_ur": name_ur, "category": category, "unit": "kg",
                    "current_stock": Decimal(stock), "minimum_stock": Decimal(minimum),
                    "purchase_rate": Decimal(rate), "is_active": True,
                },
            )
            items.append(item)

        # Buyer purchases/sales: 3-4 invoices per day, each with 1-3 inventory lines.
        invoice_number = 1
        sold_quantities = {item.id: Decimal("0") for item in items}
        for day in range(1, last_day + 1):
            sale_date = date(year, month, day)
            for client in rng.sample(clients, 3 + (day % 2)):
                purchase = Purchase.objects.create(
                    client=client, purchase_date=sale_date,
                    reference_number=f"{marker}-SALE-{invoice_number:04d}",
                    vehicle_number=f"LE{rng.choice('ABCDEFG')}-{rng.randint(100, 999)}",
                    status="completed", notes=f"{marker} generated buyer sale", created_by=user,
                )
                total = Decimal("0")
                for item in rng.sample(items, rng.randint(1, 3)):
                    quantity = Decimal(rng.randrange(20, 91))
                    rate = item.purchase_rate + Decimal(rng.randrange(18, 56))
                    line_total = quantity * rate
                    PurchaseItem.objects.create(
                        purchase=purchase, inventory_item=item, item_name=item.name,
                        unit=item.unit, rate=rate, quantity=quantity, total=line_total,
                    )
                    sold_quantities[item.id] += quantity
                    total += line_total
                purchase.grand_total = total
                purchase.save(update_fields=["grand_total"])
                LedgerEntry.objects.create(
                    client=client, entry_type="purchase", amount=total,
                    description=f"{marker} sale {purchase.reference_number}",
                    entry_date=sale_date, purchase=purchase, created_by=user,
                )
                invoice_number += 1

            # Daily recovery from 2-4 buyers, capped to a realistic payment range.
            for client in rng.sample(clients, rng.randint(2, 4)):
                amount = Decimal(rng.randrange(4000, 18001) // 500 * 500)
                LedgerEntry.objects.create(
                    client=client, entry_type="credit", amount=-amount,
                    description=f"{marker} recovery receipt {day:02d}",
                    entry_date=sale_date, created_by=user,
                )

        # Keep displayed stock coherent: starting supply minus this month's sales.
        for item in items:
            item.current_stock = max(Decimal("0"), item.current_stock - sold_quantities[item.id])
            item.save(update_fields=["current_stock"])

        expense_templates = [
            ("Transport", "Market vehicle fuel", "Shell Station", "Cash", 2800, 5200),
            ("Labour", "Loading and unloading wages", "Daily labour team", "Cash", 3500, 7500),
            ("Utilities", "Electricity and cold storage", "Utility office", "Bank transfer", 4200, 9000),
            ("Packaging", "Crates, bags and packing material", "Mandi Packaging", "Cash", 1800, 4800),
            ("Maintenance", "Vehicle and equipment maintenance", "Workshop", "Cash", 2200, 6500),
            ("Market Fee", "Daily market and gate charges", "Market Committee", "Cash", 1200, 3200),
            ("Office", "Stationery, tea and office supplies", "Local supplier", "Mobile wallet", 900, 2600),
        ]
        expense_count = 0
        for day in range(1, last_day + 1):
            expense_date = date(year, month, day)
            selected = rng.sample(expense_templates, 2 if day % 3 == 0 else 1)
            for category, title, paid_to, method, low, high in selected:
                Expense.objects.create(
                    category=category, title=title,
                    amount=Decimal(rng.randrange(low, high + 1) // 100 * 100),
                    expense_date=expense_date, paid_to=paid_to, payment_method=method,
                    notes=f"{marker} generated operating expense", created_by=user,
                )
                expense_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"{marker}: {len(clients)} clients, {len(items)} inventory items, "
            f"{invoice_number - 1} buyer sales, "
            f"{LedgerEntry.objects.filter(description__startswith=marker, entry_type='credit').count()} recoveries, "
            f"and {expense_count} expenses created for {month_start:%B %Y} through day {last_day}."
        ))
