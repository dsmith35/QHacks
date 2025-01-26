from rest_framework import serializers
from backend.models import Invoice, InvoiceItem

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = (
            "description",
            "quantity",
            "price",
        )

class InvoicesSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    sender = serializers.SerializerMethodField()
    recipient = serializers.SerializerMethodField()
    order_number = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = (
            "order_number",
            "sender",
            "recipient",
            "items",
            "total_cost",
            "created_at"
        )

    def get_sender(self, obj):
        return obj.order.sender.id 

    def get_recipient(self, obj):
        return obj.order.recipient.id

    def get_order_number(self, obj):
        return obj.order.order_number
