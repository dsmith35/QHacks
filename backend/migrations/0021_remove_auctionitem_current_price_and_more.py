# Generated by Django 5.0.6 on 2025-01-25 08:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0020_alter_auctionitem_options_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='auctionitem',
            name='current_price',
        ),
        migrations.AddField(
            model_name='auctionitem',
            name='highest_bid',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=12),
        ),
    ]
