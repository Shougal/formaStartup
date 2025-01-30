from django.test import TestCase
from .models import Provider, Customer, User
from django.urls import reverse


# Create your tests here.
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
                    Testing Registration forms
"""

class ProviderRegistrationTestCase(TestCase):
    def test_provider_registration_form(self):
        response = self.client.get(reverse('register_provider'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'registration/register_provider.html')

        # Test form submission
        data = {
            'username': 'newprovider',
            'email': 'provider@example.com',
            'password1': 'testpassword123',
            'password2': 'testpassword123',
            'specialty': 'Testing',
            'location': 'Testville',
            'availability': '{"Monday": "9-5"}',  # Added availability
            'prices': '{"Service A": "50"}',  # Added prices
        }
        response = self.client.post(reverse('register_provider'), data)
        self.assertEqual(response.status_code, 302)  # redirect after successful registration

        # Check that the user was created
        self.assertTrue(Provider.objects.filter(username='newprovider').exists())


"""Customer registration"""
class CustomerRegistrationTestCase(TestCase):
    def test_customer_registration_form(self):
        response = self.client.get(reverse('register_customer'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'registration/register_customer.html')

        # Test form submission
        data = {
            'username': 'newcustomer',
            'email': 'customer@example.com',
            'password1': 'testpassword123',
            'password2': 'testpassword123',
            'location': 'Testville',
        }
        response = self.client.post(reverse('register_customer'), data)
        self.assertEqual(response.status_code, 302)  # redirect after successful registration

        # Check that the user was created
        self.assertTrue(Customer.objects.filter(username='newcustomer').exists())





        """
                        Login and Logout Functionalities
        """
class AuthTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', username='testuser', password='password123')

    """Testing Login"""
    def test_login_valid_user(self):
        response = self.client.post(reverse('login'), {'email': 'test@example.com', 'password': 'password123'})
        self.assertEqual(response.status_code, 302)  # expecting a redirect after login

    def test_login_invalid_user(self):
        response = self.client.post(reverse('login'), {'email': 'wrong@example.com', 'password': 'password'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue('invalid login' in response.content.decode())

    """Tetsing Logout"""
    def test_logout(self):
        self.client.login(email='test@example.com', password='password123')
        response = self.client.get(reverse('logout'))
        self.assertEqual(response.status_code, 302)  # expecting a redirect after logout

    def test_session_after_login(self):
        self.client.login(email='test@example.com', password='password123')
        """TODO: Change view to correct view name after Implementing it, this is TDD"""
        #TODO:Change view later - this is only for testing purposes
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)  # User should be logged in
