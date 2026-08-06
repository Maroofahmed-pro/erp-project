from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0002_client_name_ur"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Vendor",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150)),
                ("name_ur", models.CharField(blank=True, max_length=150)),
                ("phone", models.CharField(blank=True, max_length=30)),
                ("address", models.TextField(blank=True)),
                ("opening_balance", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("is_active", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name="VendorPayment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("payment_date", models.DateField()),
                ("amount", models.DecimalField(decimal_places=2, max_digits=14)),
                ("payment_method", models.CharField(default="cash", max_length=50)),
                ("reference_number", models.CharField(blank=True, max_length=80)),
                ("notes", models.TextField(blank=True)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ("vendor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="payments", to="core.vendor")),
            ],
        ),
        migrations.CreateModel(
            name="VendorDailyEntry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("entry_date", models.DateField()),
                ("item_name", models.CharField(max_length=150)),
                ("quantity", models.DecimalField(decimal_places=2, max_digits=14)),
                ("unit", models.CharField(default="bags", max_length=30)),
                ("rate", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("gross_amount", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("margin", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("deductions", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("vendor_amount", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("vehicle_number", models.CharField(blank=True, max_length=80)),
                ("reference_number", models.CharField(blank=True, max_length=80)),
                ("notes", models.TextField(blank=True)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ("vendor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="daily_entries", to="core.vendor")),
            ],
        ),
    ]
