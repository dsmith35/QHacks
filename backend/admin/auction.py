# backend/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from backend.models import AuctionItem, AuctionBid
from backend.utils import Strings  # Ensure this contains necessary verbose names

class AuctionBidInline(admin.TabularInline):
    model = AuctionBid
    extra = 0
    readonly_fields = ("bidder", "bid_amount", "created_at")
    can_delete = False
    show_change_link = True
    fields = ("bidder", "bid_amount", "created_at")
    
    def has_add_permission(self, request, obj):
        return False  # Prevent adding bids directly from the AuctionItem admin

@admin.register(AuctionItem)
class AuctionItemAdmin(admin.ModelAdmin, DynamicArrayMixin):
    list_display = (
        "title",
        "seller",
        "highest_bid",
        "highest_bid_user",
        "starting_price",
        "min_bid_increment",
        "is_active",
        "end_time",
        "created_at",
        "image_preview",  # Add image preview to list display
        "pinned_users_count",  # Show count of pinned users
    )
    
    list_filter = (
        "visible",
        "seller__first_name",
        "seller__last_name",
        "created_at",
    )
    
    search_fields = (
        "title",
        "seller__first_name",
        "seller__last_name",
        "slug",
    )
    
    readonly_fields = ("highest_bid", "highest_bid_user", "created_at", "slug", "end_time", "pinned_users_list")
    
    fieldsets = (
        (None, {"fields": ("seller", "title", "description", "image")}),  # Include image field here
        ("Pricing", {"fields": ("starting_price", "highest_bid", "highest_bid_user", "min_bid_increment")}),
        ("Auction Details", {"fields": ("duration", "end_time", "visible", "pinned_users_list")}),
        ("Slug", {"fields": ("slug",)}),
    )
    
    inlines = [AuctionBidInline]
    
    list_select_related = ('seller',)
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" />', obj.image.url)
        return "No Image"
    image_preview.short_description = "Image Preview"

    def pinned_users_list(self, obj):
        """Display the list of users who have pinned the auction."""
        users = obj.pinned_by.all()
        if not users:
            return "No users have pinned this item."
        return ", ".join([str(user.id) for user in users])
    pinned_users_list.short_description = "Pinned Users"

    def pinned_users_count(self, obj):
        """Display the count of users who have pinned the auction."""
        return obj.pinned_by.count()
    pinned_users_count.short_description = "Pinned Count"
    
    class Meta:
        verbose_name = Strings.AUCTION_ITEM
        verbose_name_plural = Strings.AUCTION_ITEMS


@admin.register(AuctionBid)
class AuctionBidAdmin(admin.ModelAdmin, DynamicArrayMixin):
    list_display = (
        "bidder",
        "auction_item",
        "bid_amount",
        "created_at",
    )
    
    list_filter = (
        "created_at",
        "auction_item__title",
        "bidder__first_name",
        "bidder__last_name",
    )
    
    search_fields = (
        "auction_item__title",
        "bidder__first_name",
        "bidder__last_name",
    )
    
    readonly_fields = ("created_at",)
    
    fieldsets = (
        (None, {"fields": ("auction_item", "bidder", "bid_amount")}),
        ("Timestamp", {"fields": ("created_at",)}),
    )
    
    list_select_related = ('auction_item', 'bidder',)
    list_per_page = 50
    date_hierarchy = 'created_at'
    
    class Meta:
        verbose_name = Strings.AUCTION_BID
        verbose_name_plural = Strings.AUCTION_BIDS
