# Generated by Django 5.0.6 on 2025-01-26 07:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0024_auctionitem_pinned_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='auctionitem',
            name='highest_bid_user',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
