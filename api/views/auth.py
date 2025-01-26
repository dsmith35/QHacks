from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.utils.decorators import method_decorator
from api.utils import validate_auth_token
from dj_rest_auth.registration.views import RegisterView
from api.serializers.users import RegisterSerializer

@method_decorator(csrf_exempt, name='dispatch')
class LoginEndpoint(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            response = Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
            
            # Set HTTP-only cookie 'auth_token'
            response.set_cookie(
                'auth_token',
                token.key,
                httponly=True,
                samesite='None',
                secure=True,
                path='/',
            )
            print(f"Token generated for user '{user.username}': {token.key}")
            
            return response
        else:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutEndpoint(APIView):

    def post(self, request):
        response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        # request.user.auth_token.delete()
        response.set_cookie(
                'auth_token',
                None,
                httponly=True,
                samesite='None',
                secure=True,
                expires='Thu, 01 Jan 1970 00:00:00 GMT',
                path='/',
            )
        return response


class CheckAuthEndpoint(APIView):

    def get(self, request, *args, **kwargs):
            error_response, user = validate_auth_token(request)
            return Response(bool(user))

class RegisterEndpoint(RegisterView):
    serializer_class = RegisterSerializer