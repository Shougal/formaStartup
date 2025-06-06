from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .models import User, Provider, Customer, Availability, CustomerAppointment

User = get_user_model()

class ProviderSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    img = serializers.ImageField(max_length=None, allow_empty_file=True, use_url=True, required=False)

    class Meta:
        model = Provider
        #TODO: Do not include is_approved to fields, should default to false
        fields = ['id', 'username', 'email', 'location', 'specialty', 'availability', 'prices', 'is_approved', 'password','first_name', 'last_name', 'theme','portfolio_link', 'calendly_link', 'img' ]
        extra_kwargs = {'password': {'write_only': True}}
        # 'is_approved': {'default': False, 'read_only': True}

    def validate_email(self, value):
        #Used __iexact which is a field lookup in Django that performs a case-insensitive exact match, which means it will find an email regardless of its case.
        lower_email = value.lower()
        if User.objects.filter(email__iexact=lower_email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        lower_username = value.lower()
        if User.objects.filter(username__iexact=lower_username).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    #TODO: The create below work for password checks, which to use? Should i provider.save()?
    # def create(self, validated_data):
    #     validated_data['is_provider'] = True
    #     return User.objects.create_user(**validated_data)
    def create(self, validated_data):
        password = validated_data.pop('password')
        provider = Provider(**validated_data)
        provider.set_password(password)
        provider.is_provider = True
        provider.save()
        return provider


class CustomerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    class Meta:
        model = Customer
        fields = ['id', 'username', 'email', 'location', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        lower_email = value.lower()
        if User.objects.filter(email__iexact=lower_email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        lower_username = value.lower()
        if User.objects.filter(username__iexact=lower_username).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    #TODO: Password hashing logic is wrong
    def create(self, validated_data):
        password = validated_data.pop('password')
        customer = Customer(**validated_data)
        customer.set_password(password)
        customer.is_customer = True  # Assuming this field is still part of your User model
        customer.save()
        return customer
        # validated_data['is_customer'] = True
        # return User.objects.create_user(**validated_data)




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


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        try:
            RefreshToken(self.validated_data['refresh']).blacklist()
        except TokenError:
            raise serializers.ValidationError({'error': 'Invalid or expired token'})


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['id', 'provider', 'day', 'time_slots']
        read_only_fields = ['provider']


class CustomerAppointmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    provider_name = serializers.CharField(source='provider.username', read_only=True)

    class Meta:
        model = CustomerAppointment
        fields = ['id', 'customer', 'provider', 'date', 'time', 'customer_name', 'provider_name']
        read_only_fields = ['customer']

