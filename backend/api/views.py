from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
# from .forms import ProviderSignUpForm, CustomerSignUpForm
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .models import User, Provider, Customer
from .serializers import UserSerializer, ProviderSerializer, CustomerSerializer, LogoutSerializer
from rest_framework.response import Response
from rest_framework import status, permissions, generics, serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


"""         Register Provider View with serializer and email&username validation    """

class RegisterProviderView(APIView):
    """
    Handles provider registration.
    """

    queryset = Provider.objects.all()  #Set the queryset for providers
    serializer_class = ProviderSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        username = request.data.get('username')

        # Check if email or username already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"error": "A user with this username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Use the serializer to validate and save the data
        serializer = ProviderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

"""         Customer registration view with serializer and email&username validation"""
class RegisterCustomerView(APIView):
    """
    Handles customer registration.
    """
    #TODO: handle image uploads

    queryset = Customer.objects.all()  # Set the queryset for customers
    serializer_class = CustomerSerializer
    permission_classes = [AllowAny]  # Allow anyone to register
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        username = request.data.get('username')

        # Check if email or username already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"error": "A user with this username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Use the serializer to validate and save the data
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#TODO: Remove index - and ad Home page instead
def index(request):
    return render(request, 'index.html')

"""                           Login and Logout Views                             """

class UserLoginView(generics.GenericAPIView):
    """
    Generic Login View for Customers & Providers using GenericAPIView.
    """
    serializer_class = TokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can attempt login

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        # Authenticate user
        user = authenticate(request, email=email, password=password)

        if not user:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"error": "This account is inactive."}, status=status.HTTP_403_FORBIDDEN)

        # Generate JWT tokens using TokenObtainPairSerializer
        serializer = self.get_serializer(data={"email": email, "password": password})
        serializer.is_valid(raise_exception=True)

        return Response({
            'refresh': serializer.validated_data['refresh'],
            'access': serializer.validated_data['access'],
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'is_provider': user.is_provider,
            'is_customer': user.is_customer
        }, status=status.HTTP_200_OK)


class UserLogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()  # This blacklists the token
            return Response({"message": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except serializers.ValidationError as e:
            return Response({'error': str(e.detail)}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError as e:
            # Handle the case where the token is already blacklisted
            return Response({'error': 'Token is already blacklisted or invalid.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

"""This view is mainly just to test blaclisted tokens - A view for authorized users only"""

#TODO: Remove view before deployment. OR leave it
class TestProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "You are authenticated!"})

"""         This class aims to filter approved providers to render in front-end pages       """
class ApprovedProvidersView(APIView):
    """
    Fetch approved providers based on their specialty.
    """


    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]
    def get(self, request, specialty):
        # Fetch all approved providers with the specified specialty
        approved_providers = Provider.objects.filter(is_approved=True, specialty=specialty)
        serializer = ProviderSerializer(approved_providers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)