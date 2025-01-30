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

class UserLoginView(APIView):
    """
    Handles user login and returns a JWT token upon successful authentication.
    """
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        # Authenticate the user
        user = authenticate(request, email=email, password=password)
        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'is_provider': user.is_provider,
                'is_customer': user.is_customer
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

# def user_login(request):
#     if request.method == 'POST':
#         email = request.POST.get('email')
#         password = request.POST.get('password')
#         user = authenticate(request, email=email, password=password)
#         if user is not None:
#             login(request, user)
#             #TODO: Change from index to correct redirect page later
#             return redirect('index')
#         else:
#             #TODO: Add specific/correct login html
#             return render(request, 'login.html', {'error': 'invalid login'})
#     else:
#         #TODO: Add specific/correct login html
#         return render(request, 'login.html')


class UserLogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(status=status.HTTP_205_RESET_CONTENT)


# class UserLogoutView(APIView):
#     """
#     Handle user logout by blacklisting the refresh token.
#     """
#     permission_classes = [IsAuthenticated]  # Requires authentication to logout
#
#     def post(self, request, *args, **kwargs):
#         try:
#             # Get refresh token from request data
#             refresh_token = request.data.get('refresh_token')
#             if not refresh_token:
#                 return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
#             token = RefreshToken(refresh_token)
#
#             # Blacklist the refresh token
#             token.blacklist()
#
#             return Response(
#                 {'message': 'Logout successful.'},
#                 status=status.HTTP_200_OK
#             )
#         except Exception as e:
#             # Check if it's a token-related error
#             if 'Token is invalid or expired' in str(e):
#                 return Response(
#                     {'error': 'Invalid or expired token.'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#             return Response(
#                 {'error': 'Something went wrong during logout.'},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
#
# def user_logout(request):
#     logout(request)
#     #TODO: Redirect to correct login page
#     return redirect('login')

#TODO: Reimplement this by adding correct redirect
# @login_required
# @user_passes_test(lambda user: user.is_superuser)
# def admin_dashboard(request):
#     return render(request, 'admin_dashboard.html')
#
# @login_required
# @user_passes_test(lambda user: user.is_provider)
# def provider_dashboard(request):
#     return render(request, 'provider_dashboard.html')
#
# @login_required
# @user_passes_test(lambda user: user.is_customer)
# def customer_dashboard(request):
#     return render(request, 'customer_dashboard.html')
