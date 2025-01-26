from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from backend.models import Publication
from api.filters.publications import PublicationFilter
from api.serializers.publications import PublicationsSerializer
from api.utils import Pagination
from rest_framework.permissions import IsAuthenticated
from api.utils import sorting_method_a

sorting_method = sorting_method_a #None if no sorting

class PaginatedPublicationsEndpoint(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    queryset = Publication.objects.all()
    serializer_class = PublicationsSerializer
    pagination_class = Pagination
    def get_queryset(self):
        queryset = super().get_queryset()
        if sorting_method:
            sorted_queryset = sorting_method(queryset)
            return sorted_queryset
        return queryset


class PublicationsEndpoint(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    queryset = Publication.objects.all()
    serializer_class = PublicationsSerializer


class PublicationsQueryEndpoint(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    queryset = Publication.objects.all()
    serializer_class = PublicationsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PublicationFilter


class PaginatedPublicationsQueryEndpoint(generics.ListAPIView):
    # permission_classes = (IsAuthenticated,)
    queryset = Publication.objects.all()
    serializer_class = PublicationsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PublicationFilter
    pagination_class = Pagination
    def get_queryset(self):
        queryset = super().get_queryset()
        if sorting_method:
            sorted_queryset = sorting_method(queryset)
            return sorted_queryset
        return queryset



class PublicationEndpoint(APIView):
    # permission_classes = (IsAuthenticated,)


    def get(self, request, format=None, **kwargs):
        """
        Returns the a publication by its slug.
        """
        try:
            publication = Publication.objects.get(slug=kwargs.get("slug"))
            if not publication.visible:
                return Response("This publication is not public.", status=status.HTTP_401_UNAUTHORIZED)

            formatted_publication = {
                "id": publication.id,
                "user": str(publication.user),
                "title": publication.title,
                "description": publication.description,
                "created_at": publication.created_at,
                "slug": publication.slug,
                "about": publication.about,
                "image": publication.image.url,
                "rating": publication.rating,
                "num_ratings": publication.num_ratings,
                "visible": publication.visible,
                "available": publication.available,
                "hr_rate": publication.hr_rate,
            }

            return Response(formatted_publication, status=status.HTTP_200_OK)
        except Publication.DoesNotExist:
            return Response("This publication doesn't exist.", status=status.HTTP_404_NOT_FOUND)
