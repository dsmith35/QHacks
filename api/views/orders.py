from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from backend.models import Order
from api.serializers.orders import OrdersSerializer
from django.db.models import Q
from api.utils import validate_auth_token

class OrderEndpoint(generics.ListAPIView):
    def get_serializer_class(self):
        return OrdersSerializer
    
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
            return Response({"error": "Order not found or you do not have permission to view this order"}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the order
        serializer = OrdersSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        # Validate the auth token
        error_response, user = validate_auth_token(request)
        if error_response:
            return error_response

        # Retrieve the order number from the request
        order_number = kwargs.get("order_number")
        if not order_number:
            return Response({"error": "No order number provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Staff can update any order; users can update their orders only
            if user.is_staff:
                order = Order.objects.get(order_number=order_number)
            else:
                order = Order.objects.get(
                    Q(order_number=order_number) & (Q(recipient=user) | Q(sender=user))
                )
        except Order.DoesNotExist:
            return Response({"error": "Order not found or you do not have permission to modify this order"}, status=status.HTTP_404_NOT_FOUND)

        # Update the 'invoice_paid' field
        paid_status = request.data.get("invoice_paid")
        if paid_status is None:
            return Response({"error": "Missing 'complete' field in the request body"}, status=status.HTTP_400_BAD_REQUEST)

        order.invoice_paid = paid_status
        order.save()

        # Serialize the updated order
        serializer = OrdersSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class UserOrdersEndpoint(generics.ListAPIView):
    serializer_class = OrdersSerializer

    def get_queryset(self):
        # Validate the auth token
        error_response, user = validate_auth_token(self.request)
        if error_response:
            return Order.objects.none()  # Return an empty queryset if there's an error

        # Retrieve orders where the user is either the recipient or the sender
        queryset = Order.objects.filter(Q(recipient=user) | Q(sender=user))
        
        # Sort by created_at (ascending order)
        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        # Validate the auth token again to return a proper error response if needed
        error_response, user = validate_auth_token(request)
        if error_response:
            return error_response

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
