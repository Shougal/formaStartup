from django.test import TestCase
from .models import Provider, Customer


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

    # def test_model_fields(self):
    #     provider = Provider.objects.create(
    #         username = "provider1", email='provider1@example.com',
    #         password = "testpass123", specialty = "Photographer",
    #         availability = "{'MON': '9-5'}", prices= "{'1 person': '50', '2 person': '60', '3 person': '70'}"
    #         , location = "Charlotessville, VA"
    #     )
    #     self.assertEqual(provider.username, 'provider1')
    #     self.assertEqual(provider.email, 'provider1@example.com')
    #     self.assertEqual(provider.password, 'testpass123')
    #     self.assertEqual(provider.specialty, 'Photographer')
    #     self.assertEqual(provider.availability, "{'MON': '9-5'}")
    #     self.assertEqual(provider.prices, "{'1 person': '50', '2 person': '60', '3 person': '70'}")
    #     self.assertEqual(provider.location, "Charlotessville, VA")
    #     self.assertEqual(provider.is_approved, False)


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


    # def test_model_fields(self):
    #     customer = Customer.objects.create(username = 'customer1', email='customer1@example.com',
    #     password = 'customer1', location = 'Charlotessville, VA',)
    #     self.assertEqual(customer.username, 'customer1')
    #     self.assertEqual(customer.email, 'customer1@example.com')
    #     self.assertEqual(customer.password, 'customer1')
    #     self.assertEqual(customer.location, 'Charlotessville, VA')