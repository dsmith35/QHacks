# Generated by Django 5.0.6 on 2024-07-23 22:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0006_order_recipient_order_sender'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='invoice_ready',
            field=models.BooleanField(default=True),
        ),
    ]