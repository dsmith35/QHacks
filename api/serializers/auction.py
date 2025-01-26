from rest_framework import serializers
from backend.models import AuctionItem, AuctionBid


class AuctionItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(read_only=True)

    def get_image(self, instance):
        return instance.image.url

    class Meta:
        model = AuctionItem
        fields = (
            "id",
            "seller",
            "title",
            "description",
            "image",
            "duration",
            "starting_price",
            "min_bid_increment",
            "highest_bid",
            "highest_bid_user",
            "end_time",
            "visible",
            "created_at",
            "end_time",
            "slug",
            "pinned_by",
            )

class AuctionBidSerializer(serializers.ModelSerializer):

    class Meta:
        model = AuctionBid
        fields = (
            "bidder",
            "auction_item",
            "bid_amount",
            "created_at",
        )