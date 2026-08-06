from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0003_vendor_vendor_daily_entry_vendor_payment"),
    ]

    operations = [
        migrations.AddField(
            model_name="vendorpayment",
            name="item_name",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="vendorpayment",
            name="total_amount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=14),
        ),
        migrations.AddField(
            model_name="vendorpayment",
            name="kiraya",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=14),
        ),
        migrations.AddField(
            model_name="vendorpayment",
            name="mazdori",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=14),
        ),
        migrations.AddField(
            model_name="vendorpayment",
            name="commission_percentage",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=7),
        ),
        migrations.AddField(
            model_name="vendorpayment",
            name="commission_amount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=14),
        ),
    ]
