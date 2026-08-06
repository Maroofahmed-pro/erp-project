from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("core", "0004_vendorpayment_breakdown")]
    operations = [
        migrations.AddField(model_name="vendor", name="city", field=models.CharField(blank=True, max_length=100)),
        migrations.AddField(model_name="vendor", name="category", field=models.CharField(blank=True, default="Retailer", max_length=50)),
        migrations.AddField(model_name="vendor", name="credit_limit", field=models.DecimalField(decimal_places=2, default=0, max_digits=14)),
    ]
