# Generated by Django 5.0.6 on 2024-07-23 23:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0009_invoice_total_cost'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invoice',
            name='total_cost',
            field=models.IntegerField(default=0),
        ),
    ]
