from django.test import TestCase
from .models import Provider


# Create your tests here.
"""
Testing the provider model
"""

class ProviderTestCase(TestCase):
    def test_model_fields(self):
        provider = Provider.objects.create(
            username = "provider1", email='provider1@example.com',
            password = "testpass123", specialty = "Photographer",
            availability = "{'MON': '9-5'}", prices= "{'1 person': '50', '2 person': '60', '3 person': '70'}"
            , location = "Charlotessville, VA"
        )
        self.assertEqual(provider.username, 'provider1')
        self.assertEqual(provider.email, 'provider1@example.com')
        self.assertEqual(provider.password, 'testpass123')
        self.assertEqual(provider.specialty, 'Photographer')
        self.assertEqual(provider.availability, "{'MON': '9-5'}")
        self.assertEqual(provider.prices, "{'1 person': '50', '2 person': '60', '3 person': '70'}")
        self.assertEqual(provider.location, "Charlotessville, VA")
        self.assertEqual(provider.is_approved, False)