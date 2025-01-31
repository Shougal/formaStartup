from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .models import User, Provider, Customer

User = get_user_model()

class ProviderSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    class Meta:
        model = Provider
        #TODO: Do not include is_approved to fields, should default to false
        fields = ['id', 'username', 'email', 'location', 'specialty', 'availability', 'prices', 'is_approved', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    #TODO: The create below work for password checks, which to use? Should i provider.save()?
    def create(self, validated_data):
        validated_data['is_provider'] = True
        return User.objects.create_user(**validated_data)

    # def create(self, validated_data):
    #     password = validated_data.pop('password', None)
    #     provider = Provider.objects.create_user(**validated_data)  # Using create_user instead of direct instantiation
    #     provider.is_provider = True
    # TODO: Should save user or should that be done in views.py?
    #     provider.save()
    #     return provider

class CustomerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    class Meta:
        model = Customer
        fields = ['id', 'username', 'email', 'location', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    #TODO: Password hashing logic is wrong
    def create(self, validated_data):
        validated_data['is_customer'] = True
        return User.objects.create_user(**validated_data)
        # password = validated_data.pop('password', None)
        # customer = Customer.objects.create_user(**validated_data)  # Using create_user for proper handling
        # customer.is_customer = True
        # # TODO: Should save user or should that be done in views.py?
        # # customer.save()
        # return customer



class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model. Handles creation and updates securely, ensuring passwords are hashed.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_provider', 'is_customer', 'location')
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        """
        Create and return a new user, ensuring the password is hashed before being stored.
        """
        user = User.objects.create_user(**validated_data)
        #TODO: Should save user or should that be done in views.py?
        # user.save()
        # user = User(
        #     email=validated_data['email'],
        #     username=validated_data['username'],
        #     is_provider=validated_data.get('is_provider', False),
        #     is_customer=validated_data.get('is_customer', False),
        #     location=validated_data.get('location', '')
        # )
        # #TODO: Check password hashing logic in tests.py
        # user.set_password(validated_data['password'])
        # user.save()
        return user

    def update(self, instance, validated_data):
        """
        Update and return an existing user instance, ensuring the password is hashed if provided.
        """
        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        instance.is_provider = validated_data.get('is_provider', instance.is_provider)
        instance.is_customer = validated_data.get('is_customer', instance.is_customer)
        instance.location = validated_data.get('location', instance.location)

        password = validated_data.get('password')
        if password:
            instance.set_password(password)

        instance.save()
        return instance

""" Logout serializer"""
# class LogoutSerializer(serializers.Serializer):
#     refresh = serializers.CharField()
#
#     def update(self, attrs):
#         self.token = attrs['refresh']
#         return attrs
#
#     def save(self, **kwargs):
#         try:
#             RefreshToken(self.token).blacklist()
#         except TokenError:
#             raise serializers.ValidationError({'error': 'Invalid or expired token'})


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.validated_data['refresh'])
            token.blacklist()
        except TokenError:
            raise serializers.ValidationError({'error': 'Invalid or expired token'})

#TODO: Refresh and access token check
#
# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
#     """
#     Custom serializer for JWT token creation, including additional user data in the token payload.
#     """
#
#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)
#
#         # Add custom claims
#         token['is_provider'] = user.is_provider
#         token['is_customer'] = user.is_customer
#
#         return token
#
#     def validate(self, attrs):
#         # The default result (access and refresh tokens)
#         data = super().validate(attrs)
#
#         # Custom data you want to include in the response upon token creation
#         refresh = self.get_token(self.user)
#
#         data['refresh'] = str(refresh)
#         data['access'] = str(refresh.access_token)
#         data['is_provider'] = self.user.is_provider
#         data['is_customer'] = self.user.is_customer
#         data['username'] = self.user.username
#         data['email'] = self.user.email
#
#         return data
