from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from backend.models import Order, Invoice
from api.serializers.invoices import InvoicesSerializer
from django.db.models import Q
from api.utils import validate_auth_token

class InvoicesEndpoint(generics.ListAPIView):
    def get(self, request, *args, **kwargs):
            # Validate the auth token
            error_response, user = validate_auth_token(request)
            if error_response:
                return error_response
            # Retrieve the order number from the request
            order_number = kwargs.get("order_number")

            if not order_number:
                return Response({"error": "No order number provided"}, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve the order where the user is either the recipient or the sender and the order number matches
            try:
                if user.is_staff:
                    # Staff can view any order
                    order = Order.objects.get(order_number=order_number)
                else:
                    # Regular users can only view orders where they are the recipient or sender
                    order = Order.objects.get(Q(order_number=order_number) & (Q(recipient=user) | Q(sender=user)))
            except Order.DoesNotExist:
                return Response({"error": "Order not found or you do not have permission to view this order and any associated invoices"}, status=status.HTTP_404_NOT_FOUND)

            try:
                invoice = Invoice.objects.get(order=order.id)
            except:
                return Response({"error": "Invoice not found for this order"}, status=status.HTTP_404_NOT_FOUND)
            
            # Serialize the invoice
            serializer = InvoicesSerializer(invoice)
            return Response(serializer.data, status=status.HTTP_200_OK)
