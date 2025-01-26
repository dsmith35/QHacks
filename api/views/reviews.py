from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from backend.models import Review
from api.serializers.reviews import ReviewsSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

REVIEW_PAGE_MAX_LENGTH = 5
class CustomPageNumberPagination(PageNumberPagination):
    page_size = REVIEW_PAGE_MAX_LENGTH  # Number of reviews per page
    page_size_query_param = 'page_size'
    max_page_size = 100

class ReviewsEndpoint(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    serializer_class = ReviewsSerializer
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        pub_id = self.kwargs.get("pub_id")
        return Review.objects.filter(publication_id=pub_id).order_by('-created_at')

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()

            if not queryset.exists():
                return Response("No reviews exist for this publication.", status=status.HTTP_404_NOT_FOUND)

            page = self.paginate_queryset(queryset)
            if page is not None:
                serialized_reviews = self.serializer_class(page, many=True)
                return self.get_paginated_response(serialized_reviews.data)

            serialized_reviews = self.serializer_class(queryset, many=True)
            return Response(serialized_reviews.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
