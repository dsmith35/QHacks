from django.contrib import admin
from django.utils.html import format_html
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from backend.models import Review
from backend.utils import Strings


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin, DynamicArrayMixin):
    list_filter = ("created_at",)
    list_display = ("user", "publication", "rating", "comment", "created_at")

    fieldsets = (
        (None, {"fields": ("user", "publication", "rating", "comment")}),
    )
