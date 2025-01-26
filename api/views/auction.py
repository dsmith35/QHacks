from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from backend.models import AuctionItem
from api.filters.auction import AuctionItemFilter
from api.serializers.auction import AuctionItemSerializer
from api.utils import Pagination
from rest_framework.permissions import IsAuthenticated
from backend.models import AuctionBid
from api.serializers.auction import AuctionBidSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.authtoken.models import Token

sorting_method = None #None if no sorting

class PaginatedAuctionItemsEndpoint(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    queryset = AuctionItem.objects.all()
    serializer_class = AuctionItemSerializer
    pagination_class = Pagination
    def get_queryset(self):
        queryset = super().get_queryset()
        if sorting_method:
            sorted_queryset = sorting_method(queryset)
            return sorted_queryset
        return queryset


class AuctionItemsEndpoint(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    queryset = AuctionItem.objects.all()
    serializer_class = AuctionItemSerializer


class AuctionItemsQueryEndpoint(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    queryset = AuctionItem.objects.all()
    serializer_class = AuctionItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = AuctionItemFilter


class PaginatedAuctionItemsQueryEndpoint(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    queryset = AuctionItem.objects.all()
    serializer_class = AuctionItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = AuctionItemFilter
    pagination_class = Pagination
    def get_queryset(self):
        queryset = super().get_queryset()
        if sorting_method:
            sorted_queryset = sorting_method(queryset)
            return sorted_queryset
        return queryset



class AuctionItemEndpoint(APIView):
    # permission_classes = (IsAuthenticated,)


    def get(self, request, format=None, **kwargs):
        """
        Returns the a auction item by its slug.
        """
        try:
            auction_item = AuctionItem.objects.get(slug=kwargs.get("slug"))
            if not auction_item.visible:
                return Response("This auction_item is not public.", status=status.HTTP_401_UNAUTHORIZED)

            formatted_auction_item = {
                "id": auction_item.id,
                "seller": str(auction_item.seller),
                "title": auction_item.title,
                "description": auction_item.description,
                "created_at": auction_item.created_at,
                "slug": auction_item.slug,
                "image": auction_item.image.url,
                "visible": auction_item.visible,
                "duration": auction_item.duration,
                "starting_price": auction_item.starting_price,
                "min_bid_increment": auction_item.min_bid_increment,
                "end_time": auction_item.end_time,
                "highest_bid": auction_item.highest_bid,
                "highest_bid_user": auction_item.highest_bid_user,
            }

            return Response(formatted_auction_item, status=status.HTTP_200_OK)
        except AuctionItem.DoesNotExist:
            return Response("This auction_item doesn't exist.", status=status.HTTP_404_NOT_FOUND)
    

AUCTION_BID_PAGE_MAX_LENGTH = 5
class CustomPageNumberPagination(PageNumberPagination):
    page_size = AUCTION_BID_PAGE_MAX_LENGTH  # Number of bids per page
    page_size_query_param = 'page_size'
    max_page_size = 100

class AuctionBidsEndpoint(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    serializer_class = AuctionBidSerializer
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        auc_id = self.kwargs.get("auc_id")
        return AuctionBid.objects.filter(auction_item=auc_id).order_by('-created_at')

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()

            if not queryset.exists():
                return Response("No auction bids exist for this listing.", status=status.HTTP_404_NOT_FOUND)

            page = self.paginate_queryset(queryset)
            if page is not None:
                serialized_bids = self.serializer_class(page, many=True)
                return self.get_paginated_response(serialized_bids.data)

            serialized_bids = self.serializer_class(queryset, many=True)
            return Response(serialized_bids.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, *args, **kwargs):
        # Auth
        token_key = request.COOKIES.get('auth_token')
        if not token_key:
            return Response({"error": "No authentication token provided"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
        except Token.DoesNotExist:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Add the authenticated user to the request data
        data = request.data.copy()  # Make a mutable copy of the request data
        data['bidder'] = user.id  # Add the user's ID as the bidder

        # Pin the item for the user
        auction_item = AuctionItem.objects.get(id=data['auction_item'])
        auction_item.pinned_by.add(user)

        # Check if the auction is active
        if 'auction_item' not in data:
            return Response({"error": "Auction ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            auction = AuctionItem.objects.get(id=data['auction_item'])
            if not auction.is_active():
                return Response({"error": "Auction is no longer active"}, status=status.HTTP_400_BAD_REQUEST)
        except AuctionItem.DoesNotExist:
            return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)

        # Serialize and save the data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class PinAuctionItemView(APIView):
    def post(self, request, *args, **kwargs):
        # Extract auction_id from the URL kwargs
        auc_id = kwargs.get('auc_id')
        
        # Auth
        token_key = request.COOKIES.get('auth_token')
        if not token_key:
            return Response({"error": "No authentication token provided"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
        except Token.DoesNotExist:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Fetch auction item and pin it
        try:
            auction_item = AuctionItem.objects.get(id=auc_id)
            auction_item.pinned_by.add(user)
            return Response({"message": "Auction item pinned successfully"}, status=status.HTTP_200_OK)
        except AuctionItem.DoesNotExist:
            return Response({"error": "Auction item not found"}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, *args, **kwargs):
        # Auth
        token_key = request.COOKIES.get('auth_token')
        if not token_key:
            return Response({"error": "No authentication token provided"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
        except Token.DoesNotExist:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get pinned items for the authenticated user
        pinned_items = AuctionItem.objects.filter(pinned_by=user)
        serializer = AuctionItemSerializer(pinned_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UnpinAuctionItemView(APIView):
    def post(self, request, *args, **kwargs):
        # Extract auction_id from the URL kwargs
        auc_id = kwargs.get('auc_id')
        
        # Auth
        token_key = request.COOKIES.get('auth_token')
        if not token_key:
            return Response({"error": "No authentication token provided"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
        except Token.DoesNotExist:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Fetch auction item and unpin it
        try:
            auction_item = AuctionItem.objects.get(id=auc_id)
            auction_item.pinned_by.remove(user)
            return Response({"message": "Auction item unpinned successfully"}, status=status.HTTP_200_OK)
        except AuctionItem.DoesNotExist:
            return Response({"error": "Auction item not found"}, status=status.HTTP_404_NOT_FOUND)
