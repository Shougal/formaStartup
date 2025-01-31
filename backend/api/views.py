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
from rest_framework import status, permissions, generics
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

# def register_provider(request):
#     if request.method == 'POST':
#         form = ProviderSignUpForm(request.POST)
#         if form.is_valid():
#             form.save()
#             # TODO:Handle post-save actions here, like logging user in or redirecting
#             # TODO: Change redirect
#             return redirect('index')
#     else:
#         form = ProviderSignUpForm()
#     return render(request, 'registration/register_provider.html', {'form': form})
#
# def register_customer(request):
#     if request.method == 'POST':
#         form = CustomerSignUpForm(request.POST)
#         if form.is_valid():
#             form.save()
#             # TODO:Handle post-save actions here, like logging user in or redirecting
#             # TODO: Change redirect
#             return redirect('index')
#     else:
#         form = CustomerSignUpForm()
#     return render(request, 'registration/register_customer.html', {'form': form})
#TODO: Remove index - and ad Home page instead
def index(request):
    return render(request, 'index.html')

"""                           Login and Logout Views                             """

#TODO: HAndle Login TOKENS and REfresh Token
#
# class UserLoginView(APIView):
#     """
#     Handles user login and returns a JWT token upon successful authentication.
#     """
#     permission_classes = [AllowAny]
#     def post(self, request, *args, **kwargs):
#         email = request.data.get('email')
#         password = request.data.get('password')
#
#         # Authenticate the user
#         user = authenticate(request, email=email, password=password)
#         if user is not None:
#             # Generate JWT tokens
#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 'refresh': str(refresh),
#                 'access': str(refresh.access_token),
#                 'user_id': user.id,
#                 'username': user.username,
#                 'email': user.email,
#                 'is_provider': user.is_provider,
#                 'is_customer': user.is_customer
#             }, status=status.HTTP_200_OK)
#         else:
#             return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

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
        if not serializer.is_valid():
            return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(status=status.HTTP_205_RESET_CONTENT)
