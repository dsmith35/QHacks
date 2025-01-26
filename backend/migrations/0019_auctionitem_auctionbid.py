# Generated by Django 5.0.6 on 2025-01-25 07:43

import cloudinary.models
import datetime
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0018_alter_user_phone'),
    ]

    operations = [
        migrations.CreateModel(
            name='AuctionItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', cloudinary.models.CloudinaryField(blank=True, max_length=255, null=True, verbose_name='Image')),
                ('title', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, help_text='(50 character max)', max_length=500, verbose_name='Summary of your skills')),
                ('min_bid_increment', models.DecimalField(decimal_places=2, default=1.0, help_text='Minimum amount to increase bid by', max_digits=10, verbose_name='Minimum bid increment')),
                ('starting_price', models.DecimalField(decimal_places=2, default=0.0, help_text='Initial price of the auction item', max_digits=12, verbose_name='Starting price')),
                ('current_price', models.DecimalField(decimal_places=2, default=0.0, help_text='Current highest bid', max_digits=12, verbose_name='Current price')),
                ('duration', models.DurationField(default=datetime.timedelta(days=7), help_text='Length of time the auction will run', verbose_name='Duration')),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('visible', models.BooleanField(default=True)),
                ('available', models.BooleanField(default=False)),
                ('slug', models.SlugField(blank=True, max_length=250, null=True, unique=True)),
                ('seller', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='auction_items', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Auction Item',
                'verbose_name_plural': 'Auction Items',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='AuctionBid',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bid_amount', models.DecimalField(decimal_places=2, help_text='Amount to bid', max_digits=12, verbose_name='Bid amount')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('bidder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='auction_bids', to=settings.AUTH_USER_MODEL)),
                ('auction_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bids', to='backend.auctionitem')),
            ],
            options={
                'verbose_name': 'Auction Bid',
                'verbose_name_plural': 'Auction Bids',
                'ordering': ['-created_at'],
            },
        ),
    ]