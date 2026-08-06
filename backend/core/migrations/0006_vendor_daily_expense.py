from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0005_vendor_directory_fields"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="VendorDailyExpense",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("expense_date", models.DateField()),
                ("commission_percentage", models.DecimalField(decimal_places=2, default=0, max_digits=7)),
                ("commission_amount", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("freight", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("labor", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("cash", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("previous", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("market_fee", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("total_amount", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("total_deductions", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("final_amount", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ("vendor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="daily_expenses", to="core.vendor")),
            ],
        ),
        migrations.AddConstraint(
            model_name="vendordailyexpense",
            constraint=models.UniqueConstraint(fields=("vendor", "expense_date"), name="unique_vendor_daily_expense"),
        ),
    ]
