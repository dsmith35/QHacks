from rest_framework import serializers
from backend.models import User
from dj_rest_auth.registration.serializers import RegisterSerializer as BaseRegisterSerializer
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone',]  # Add other fields as needed

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name']  # Add other fields as needed



class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(
            queryset=User.objects.all(),
            message="This email is already registered."
        )]
    )
    password1 = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True, max_length=30)
    last_name = serializers.CharField(required=True, max_length=30)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)

    class Meta:
        model = User
        fields = ('email', 'password1', 'password2', 'first_name', 'last_name', 'phone')

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def save(self, request, *args, **kwargs):
        """
        We define save(self, request) so that dj-rest-auth's RegisterView
        can pass 'request=request' without causing a TypeError.
        """
        validated_data = dict(self.validated_data)
        validated_data.pop('password2', None)
        password = validated_data.pop('password1', None)

        # Create the user
        user = User(**validated_data)
        if password:
            user.set_password(password)

        user.save()
        return user