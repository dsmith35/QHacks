from django_filters import rest_framework as filters
from backend.models import AuctionItem


class AuctionItemFilter(filters.FilterSet):
    title = filters.CharFilter(field_name="title", lookup_expr="icontains")

    class Meta:
        model = AuctionItem
        fields = ["title"]
