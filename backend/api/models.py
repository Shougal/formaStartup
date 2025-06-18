from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

# BaseUser is now abstract (does NOT create a table)
class BaseUser(AbstractUser):
    email = models.EmailField(unique=True, blank=False)
    location = models.CharField(max_length=255, blank=True, null=True)
    is_provider = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        abstract = True  # This prevents Django from creating a table for BaseUser

# Concrete user model (Django will use this for AUTH_USER_MODEL)
class User(BaseUser):
    pass  # This is needed to create a real table in the database

""" A function to upload profile images of a user under provider_images , then 
    under their email"""
def upload_location(instance, filename):
    fileextension = filename.split('.')[-1]
    # added a UUID so each new image gets a unique filename
    filename = f'{uuid.uuid4().hex}.{fileextension}'
    return f'provider_images/{instance.email.lower()}/{filename}'
# Provider and Customer now extend User (not BaseUser)
class Provider(User):
    #TODO: make specialty a drop down menu
    specialty = models.CharField(max_length=100)
    availability = models.JSONField()
    prices = models.JSONField()
    is_approved = models.BooleanField(default=False)

    # Additional info about provider for rendering in html pages:
    theme = models.TextField(default='No specific theme', blank=True)
    portfolio_link = models.URLField(max_length=200, blank=False)
    calendly_link = models.URLField(max_length=200, blank=False)
    #TODO: Configure images later on
    img = models.ImageField(upload_to= upload_location,  null=True, blank=True)

    def save(self, *args, **kwargs):
        try:
            old = Provider.objects.get(pk=self.pk)
            if old.img and old.img!= self.img:
                old.img.delete(save=False)
            elif old.img and self.img and old.img.read() != self.img.read():
                # fallback if name is same but content changed
                old.img.delete(save=False)
        except Provider.DoesNotExist:
            pass
        super().save(*args, **kwargs)
    class Meta:
        verbose_name = "Provider"
        verbose_name_plural = "Providers"

class Customer(User):
    class Meta:
        verbose_name = "Customer"
        verbose_name_plural = "Customers"

class Availability(models.Model):
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availabilities')
    day = models.DateField()  # Stores the date
    time_slots = models.JSONField(default=list)  # List of times the provider is available

    def __str__(self):
        return f'Availability for {self.provider.username} on {self.day}'


class CustomerAppointment(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_appointments')
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='provider_appointments')
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.username} with {self.provider.username} on {self.date} at {self.time}"