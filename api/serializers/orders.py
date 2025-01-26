from rest_framework import serializers
from backend.models import Order


class OrdersSerializer(serializers.ModelSerializer):

    class Meta:
        model = Order
        fields = (
            "order_number",
            "sender",
            "recipient",
            "complete",
            "invoice_ready",
            "invoice_paid",
            "created_at",
        )