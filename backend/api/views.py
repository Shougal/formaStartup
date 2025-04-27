from django.core.exceptions import ValidationError
from django.http import Http404
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
# from .forms import ProviderSignUpForm, CustomerSignUpForm
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .models import User, Provider, Customer, Availability, CustomerAppointment
from .serializers import UserSerializer, ProviderSerializer, CustomerSerializer, LogoutSerializer, AvailabilitySerializer, CustomerAppointmentSerializer
from rest_framework.response import Response
from rest_framework import status, permissions, generics, serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models.functions import Lower
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from rest_framework_simplejwt.tokens import  TokenError


"""         Register Provider View with serializer and email&username validation    """

class RegisterProviderView(APIView):
    """
    Handles provider registration.
    """

    queryset = Provider.objects.all()  #Set the queryset for providers
    serializer_class = ProviderSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        email = request.data.get('email').lower() #To ensure case-insensitivity
        username = request.data.get('username').lower()

        # Check if email or username already exists
        #Made a lower_email instance for runtime only(not stored in db) and set to equal lower email field in db
        if User.objects.annotate(lower_email=Lower('email')).filter(lower_email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.annotate(lower_username=Lower('username')).filter(lower_username=username).exists():
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
        email = request.data.get('email').lower()
        username = request.data.get('username').lower()

        # Check if email or username already exists
        # Made a lower_email instance for runtime only(not stored in db) and set to equal lower email field in db
        if User.objects.annotate(lower_email=Lower('email')).filter(lower_email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.annotate(lower_username=Lower('username')).filter(lower_username=username).exists():
            return Response({"error": "A user with this username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Use the serializer to validate and save the data
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#TODO: Remove index - and ad Home page instead
# def index(request):
#     return render(request, 'index.html')

"""                           Login and Logout Views                             """

class UserLoginView(generics.GenericAPIView):
    """
    Generic Login View for Customers & Providers using GenericAPIView.
    """
    serializer_class = TokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can attempt login

    def post(self, request, *args, **kwargs):
        email = request.data.get('email').lower()
        password = request.data.get('password')

        # Authenticate user using Django's authenticate function and lowercase email
        user = authenticate(request, email=email, password=password)

        if not user:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"error": "This account is inactive."}, status=status.HTTP_403_FORBIDDEN)

        # Pull full Provider or Customer object (needed for subclass fields)
        try:
            if user.is_provider:
                user = Provider.objects.get(id=user.id)
            elif user.is_customer:
                user = Customer.objects.get(id=user.id)
        except (Provider.DoesNotExist, Customer.DoesNotExist):
            pass


        # Generate JWT tokens using TokenObtainPairSerializer
        serializer = self.get_serializer(data={"email": email, "password": password})
        serializer.is_valid(raise_exception=True)


        # specialty = getattr(user, 'specialty', 'No specialty provided')
        # portfolio_link = getattr(user, 'portfolio_link', '')
        # location = getattr(user, 'location', 'No location provided')
        # prices= getattr(user, 'prices', 'No prices provided')

        response_data ={
            'is_logged_in': True,
            'refresh': serializer.validated_data['refresh'],
            'access': serializer.validated_data['access'],
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'is_provider': user.is_provider,
            'is_customer': user.is_customer,
            'location': user.location,
        }

        # Conditionally add provider-only fields
        if user.is_provider:
            response_data.update({
                'specialty': user.specialty,
                'portfolio': user.portfolio_link,
                'prices': user.prices,
                'availability': user.availability,
                'theme': user.theme,
            })

        return Response(response_data, status=status.HTTP_200_OK)


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

"""This view is mainly just to test blacklisted tokens - A view for authorized users only"""

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



class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        password = data.get('password')

        if not password:
            return Response({
                'status': 'error',
                'message': 'Password is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # TODO: add here your password validation logic.
        user.set_password(password)
        user.save()
        return Response({
            'status': 'success',
            'message': 'Password changed successfully!'
        }, status=status.HTTP_200_OK)



class AvailabilityList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        availabilities = Availability.objects.filter(provider=request.user)
        serializer = AvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(provider=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AvailabilityDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return Availability.objects.get(pk=pk, provider=self.request.user)
        except Availability.DoesNotExist:
            raise Http404

    def put(self, request, pk):
        availability = self.get_object(pk)
        serializer = AvailabilitySerializer(availability, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        availability = self.get_object(pk)
        availability.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class ProviderAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, provider_id):
        provider = get_object_or_404(User, pk=provider_id, is_provider=True)
        availabilities = Availability.objects.filter(provider=provider)
        serializer = AvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)

class BookAppointmentView(generics.CreateAPIView):
    queryset = CustomerAppointment.objects.all()
    serializer_class = CustomerAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        provider = serializer.validated_data['provider']
        date = serializer.validated_data['date']
        time = serializer.validated_data['time']

        # Find matching availability
        try:
            availability = Availability.objects.get(provider=provider, day=date)
        except Availability.DoesNotExist:
            raise ValidationError("Provider has no availability for that date.")

        if time.strftime('%H:%M') not in availability.time_slots:
            raise ValidationError("Time slot not available.")

        # Remove the booked time slot
        availability.time_slots.remove(time.strftime('%H:%M'))
        availability.save()

        # Save the appointment
        serializer.save(customer=self.request.user)

class CustomerAppointmentsList(generics.ListAPIView):
    serializer_class = CustomerAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomerAppointment.objects.filter(customer=self.request.user)

class ProviderAppointmentsList(generics.ListAPIView):
    serializer_class = CustomerAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomerAppointment.objects.filter(provider=self.request.user)