from django.test import TestCase
from .models import Provider, Customer, User
from django.urls import reverse
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, ProviderSerializer, CustomerSerializer
from rest_framework.test import APITestCase
from rest_framework import status  # Import status module for HTTP response codes
from rest_framework_simplejwt.tokens import RefreshToken  # Import RefreshToken for token operations
from django.urls import path, include
from .views import TestProtectedView
from rest_framework.test import APIClient



# # Create your tests here.
"""
                Testing the provider model
"""

class ProviderTestCase(TestCase):
    """Modifying test setup to use Django's set_password"""

    def setUp(self):
        self.provider = Provider.objects.create(
            username="provider1",
            email='provider1@example.com',
            specialty="Photographer",
            availability={"MON": "9-5"},
            prices={"1 person": "50", "2 person": "60", "3 person": "70"},
            location="Charlottesville, VA"
        )
        self.provider.set_password("testpass123")
        self.provider.save()

    def test_model_fields(self):
        provider = Provider.objects.get(username="provider1")
        self.assertTrue(provider.check_password("testpass123"))
        self.assertEqual(provider.specialty, 'Photographer')
        self.assertEqual(provider.availability, {"MON": "9-5"})
        self.assertEqual(provider.prices, {"1 person": "50", "2 person": "60", "3 person": "70"})
        self.assertEqual(provider.location, "Charlottesville, VA")
        self.assertFalse(provider.is_approved)
        #TODO:Add email check

"""
                Testing th Customer model
"""
class CustomerTestCase(TestCase):

    def setUp(self):
        self.customer = Customer.objects.create(
            username='customer1',
            email='customer1@example.com',
            location='Charlottesville, VA',
        )
        self.customer.set_password('customer1')
        self.customer.save()

    def test_model_fields(self):
        customer = Customer.objects.get(username='customer1')
        self.assertTrue(customer.check_password('customer1'))
        self.assertEqual(customer.email, 'customer1@example.com')
        self.assertEqual(customer.location, 'Charlottesville, VA')



"""
                        Login and Logout Functionalities
        """



class AuthTestCase(APITestCase):
    User = get_user_model()
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='testpassword123',
            # is_active=True  # TODO: require email verification later on
        )

    def test_login_success(self):
        """
        Ensure we can successfully log in a user.
        """
        url = reverse('login')
        data = {
            'email': 'testuser@example.com',
            'password': 'testpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('refresh' in response.data and 'access' in response.data)

    def test_login_failure(self):
        """
        Ensure login fails with incorrect credentials.
        """
        url = reverse('login')
        data = {
            'email': 'testuser@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        """
        Ensure we can successfully log out a user and blacklist their token.
        """
        # Log in to get the refresh token
        login_url = reverse('login')
        login_data = {
            'email': 'testuser@example.com',
            'password': 'testpassword123'
        }
        login_response = self.client.post(login_url, login_data, format='json')
        refresh_token = login_response.data['refresh']

        # Use the refresh token to logout
        logout_url = reverse('logout')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login_response.data["access"]}')
        logout_data = {'refresh': refresh_token}
        logout_response = self.client.post(logout_url, logout_data, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_205_RESET_CONTENT)

        """Attempting to test blacklisted tokens"""
        protected_url = reverse('test-protected')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer{login_response.data["access"]}')
        protected_response = self.client.get(protected_url)
        self.assertEqual(protected_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token(self):
        """
        Ensure refresh token can be used to get a new access token.
        """
        login_url = reverse('login')
        login_data = {
            'email': 'testuser@example.com',
            'password': 'testpassword123'
        }
        login_response = self.client.post(login_url, login_data, format='json')
        refresh_url = reverse('refresh')
        refresh_data = {'refresh': login_response.data['refresh']}
        refresh_response = self.client.post(refresh_url, refresh_data, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in refresh_response.data)



"""                         Testing Serializers.py                              """


"""Testing User Serializer"""

class UserSerializerTest(TestCase):
    User = get_user_model()
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password1234',
            'is_provider': False,
            'is_customer': True,
            'location': 'Test City'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_valid_user_serializer(self):
        serializer = UserSerializer(self.user)
        data = serializer.data
        self.assertEqual(set(data.keys()), set(['id', 'username', 'email', 'is_provider', 'is_customer', 'location']))
        self.assertEqual(data['username'], self.user_data['username'])
        self.assertEqual(data['email'], self.user_data['email'])
        self.assertEqual(data['is_provider'], self.user_data['is_provider'])
        self.assertEqual(data['is_customer'], self.user_data['is_customer'])
        self.assertEqual(data['location'], self.user_data['location'])
        #TODO: Check password assertion
        # self.assertTrue(data.check_password(self.user_data['password']))


    def test_user_serializer_with_invalid_data(self):
        self.user_data['email'] = 'invalid-email'
        serializer = UserSerializer(data=self.user_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_create_user_serializer(self):
        user_count = User.objects.count()
        serializer = UserSerializer(data=self.user_data)
        if serializer.is_valid():
            serializer.save()
            self.assertEqual(User.objects.count(), user_count + 1)

"""Testing Provider serializer """


class ProviderSerializerTest(TestCase):
    def setUp(self):
        self.provider_data = {
            'username': 'provider',
            'email': 'provider@example.com',
            'password': 'safe_password123',
            'location': 'Provider City',
            'specialty': 'Healthcare',
            'availability': '{"Monday": "9-5"}',
            'prices': '{"session": "100"}',
            'is_approved': True
        }

    def test_create_provider_with_valid_data(self):
        serializer = ProviderSerializer(data=self.provider_data)
        self.assertTrue(serializer.is_valid())
        provider = serializer.save()
        self.assertEqual(User.objects.count(), 1)
        # TODO: Password hashing assertion failed
        self.assertTrue(provider.check_password(self.provider_data['password']))
        self.assertTrue(provider.is_provider)
        self.assertEqual(provider.specialty, 'Healthcare')

    def test_serializer_with_empty_data(self):
        serializer = ProviderSerializer(data={})
        self.assertFalse(serializer.is_valid())


"""Testing Customer serializer"""

#


class CustomerSerializerTest(TestCase):
    User = get_user_model()
    def setUp(self):
        self.customer_data = {
            'username': 'customer',
            'email': 'customer@example.com',
            'password': 'safe_password123',
            'location': 'Customer City',
        }

        self.customer_data['is_customer'] = True

    def test_create_customer_with_valid_data(self):
        serializer = CustomerSerializer(data=self.customer_data)
        self.assertTrue(serializer.is_valid())
        customer = serializer.save()
        self.assertEqual(User.objects.count(), 1)
        # Check that the password is set correctly, but hashed
        self.assertTrue(customer.check_password(self.customer_data['password']))
        self.assertTrue(getattr(customer, 'is_customer', False))  # Check is_customer if exists
        self.assertTrue(customer.is_customer, "Expected 'is_customer' to be True, but it is False.")

    def test_create_customer_missing_username(self):
        data = self.customer_data.copy()
        del data['username']  # Remove username to test its necessity
        serializer = CustomerSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)

    def test_create_customer_missing_email(self):
        data = self.customer_data.copy()
        del data['email']  # Remove email to test its necessity
        serializer = CustomerSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_create_customer_missing_password(self):
        data = self.customer_data.copy()
        del data['password']  # Remove password to test its necessity
        serializer = CustomerSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

"""                      Test for approved providers view               """
class ApprovedProvidersViewTest(TestCase):
    def setUp(self):
        """
        Set up the test environment with users and providers.
        """
        # Create a customer user
        self.customer = User.objects.create_user(
            username="customer1",
            email="customer1@example.com",
            password="password123",
            is_customer=True
        )

        # Create an approved provider (Barber)
        self.provider = Provider.objects.create_user(
            username="provider1",
            email="provider1@example.com",
            password="password123",
            is_provider=True,
            specialty="Barber",
            availability={"Monday": "9:00-17:00"},  # Provide a valid availability value
            prices={"Haircut": 20, "Shave": 10},  # Provide a valid prices value
            is_approved=True
        )

        # Create another approved provider (Photographer)
        self.photographer = Provider.objects.create_user(
            username="provider2",
            email="provider2@example.com",
            password="password123",
            is_provider=True,
            specialty="Photographer",
            availability={"Monday": "10:00-18:00"},  # Provide a valid availability value
            prices={"Photo session": 100},  # Provide a valid prices value
            is_approved=True
        )

        # Create an unapproved provider
        self.unapproved_provider = Provider.objects.create_user(
            username="provider3",
            email="provider3@example.com",
            password="password123",
            is_provider=True,
            specialty="Barber",
            availability={"Monday": "8:00-16:00"},  # Provide a valid availability value
            prices={"Haircut": 15},  # Provide a valid prices value
            is_approved=False
        )

        # Set up the client
        self.client = APIClient()

        # Authenticate as a customer
        self.client.login(email="customer1@example.com", password="password123")

    # def test_unauthorized_access(self):
    #     """
    #     Test that unauthorized access is denied (401).
    #     """
    #     self.client.logout()  # Logout to test unauthenticated access
    #     response = self.client.get("/api/approved-providers/Barber/")
    #     self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_approved_barber_providers(self):
        """
        Test retrieving approved providers with the specialty 'Barber'.
        """
        response = self.client.get("/api/approved-providers/Barber/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Only 1 approved Barber
        self.assertEqual(response.data[0]['username'], self.provider.username)

    def test_approved_photographer_providers(self):
        """
        Test retrieving approved providers with the specialty 'Photographer'.
        """
        response = self.client.get("/api/approved-providers/Photographer/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Only 1 approved Photographer
        self.assertEqual(response.data[0]['username'], self.photographer.username)

    def test_no_unapproved_providers(self):
        """
        Test that unapproved providers are not included in the response.
        """
        response = self.client.get("/api/approved-providers/Barber/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn(self.unapproved_provider.username, [p['username'] for p in response.data])


