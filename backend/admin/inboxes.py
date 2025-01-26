from django.contrib import admin
from django.utils.html import format_html
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from backend.models import Inbox, InboxMessage


@admin.register(Inbox)
class InboxAdmin(admin.ModelAdmin, DynamicArrayMixin):
    list_display = ("user", "count",)

    fieldsets = (
        (None, {"fields": ("user", "count",)}),
    )

@admin.register(InboxMessage)
class InboxItemAdmin(admin.ModelAdmin, DynamicArrayMixin):
    list_display = ("inbox", "content", "created_at",)

    fieldsets = (
        (None, {"fields": ("inbox", "content", "redirect",)}),
    )
