from django.core.management.base import BaseCommand
from core.models import Client, InventoryItem

class Command(BaseCommand):
    help = "Seed demo ERP data"
    def handle(self, *args, **kwargs):
        names = ["ابراهیمی","زاده ماجی","رضوان ماجی","ابدی ماجی","منیر ماجی","باجو"]
        for name in names:
            Client.objects.get_or_create(name=name)
        InventoryItem.objects.get_or_create(name="Tomato", name_ur="ٹماٹر", unit="kg")
        InventoryItem.objects.get_or_create(name="Potato", name_ur="آلو", unit="kg")
        self.stdout.write(self.style.SUCCESS("Demo data created"))
