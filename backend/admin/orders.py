from django.contrib import admin
from django.utils.html import format_html
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from backend.models import Order
from backend.utils import Strings


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin, DynamicArrayMixin):
    list_filter = ("created_at",)
    list_display = ("order_number", "created_at",)
    readonly_fields = ["order_number", "invoice_ready"]

    fieldsets = (
        (None, {"fields": ("order_number", "sender", "recipient", "complete", "invoice_ready", "invoice_paid",)}),
    )
