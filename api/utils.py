from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict
from rest_framework import status
from rest_framework.authtoken.models import Token


class Pagination(PageNumberPagination):
    page_size = 8
    page_size_query_params = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response(
            OrderedDict(
                [
                    ("count", self.page.paginator.count),
                    ("current_page", self.page.number),
                    ("total_pages", self.page.paginator.num_pages),
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("results", data),
                ]
            )
        )

def sorting_method_a(publications):
    up_to_four_num_ratings = [pub for pub in publications if pub.num_ratings <= 4]
    five_plus_num_ratings = [pub for pub in publications if pub.num_ratings > 4]

    sorted_up_to_four = sorted(up_to_four_num_ratings, key=lambda pub: pub.num_ratings, reverse=True)
    sorted_five_plus = sorted(five_plus_num_ratings, key=lambda pub: pub.rating, reverse=True)

    return sorted_five_plus + sorted_up_to_four


def validate_auth_token(request):
    """
    Validates the authentication token from the request cookies.
    Returns a tuple of (status, user) where status is either 
    a Response object indicating an error or None, and user is the 
    authenticated user or None.
    """
    # Retrieve the token from the cookie
    try:
        token_key = request.COOKIES.get('auth_token')

        if not token_key:
            return Response({"error": "No authentication token provided"}, status=status.HTTP_401_UNAUTHORIZED), None

        # Retrieve user associated with the token
        try:
            token = Token.objects.get(key=token_key)
            user = token.user

            # Check if the user is staff
            if user.is_staff:
                return None, user
            
            return None, user
        except Token.DoesNotExist:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED), None
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR), None
