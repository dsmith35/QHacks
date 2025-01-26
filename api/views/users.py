from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from backend.models import User
from api.serializers.users import UserSerializer, PublicUserSerializer
from rest_framework.authtoken.models import Token

class UserInfoEndpoint(APIView):

    def get(self, request, *args, **kwargs):
        try:
            token_key = request.COOKIES.get('auth_token')
            if not token_key:
                return Response({"error": "No authentication token provided"}, status=status.HTTP_401_UNAUTHORIZED)
            # Retrieve user associated with the token
            try:
                token = Token.objects.get(key=token_key)
            except Token.DoesNotExist:
                return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
            user = token.user
            # Assuming you have a serializer for the User model
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class PublicUserInfoEndpoint(APIView):

    def get(self, request, user_id=None, *args, **kwargs):
        try:
            # Check if user_id is provided in the URL path
            if user_id is None:
                return Response({"error": "User ID parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch user by user_id
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            # Assuming you have a serializer for the User model
            serializer = PublicUserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
