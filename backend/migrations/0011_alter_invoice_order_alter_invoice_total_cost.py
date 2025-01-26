# Generated by Django 5.0.6 on 2024-07-23 23:33

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0010_alter_invoice_total_cost'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invoice',
            name='order',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='invoices', to='backend.order'),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='total_cost',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
