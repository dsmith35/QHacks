from django.contrib import admin
from django.utils.html import format_html
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from backend.models import Invoice, InvoiceItem
from backend.utils import Strings


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin, DynamicArrayMixin):
    list_filter = ("created_at",)
    list_display = ("order", "created_at", "total_cost")
    readonly_fields = ["total_cost",]

    fieldsets = (
        (None, {"fields": ("order", "total_cost")}),
    )

@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin, DynamicArrayMixin):
    list_display = ("invoice", "description", "quantity", "price",)

    fieldsets = (
        (None, {"fields": ("invoice", "description", "quantity", "price",)}),
    )
