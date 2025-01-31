# Generated by Django 5.0.6 on 2024-07-26 18:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0014_inbox_inboxmessage'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='inbox',
            options={'verbose_name': 'Inbox', 'verbose_name_plural': 'Inboxes'},
        ),
        migrations.AlterField(
            model_name='inboxmessage',
            name='inbox',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='backend.inbox'),
        ),
    ]
