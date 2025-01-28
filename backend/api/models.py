from django.db import models
#from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
# Create your models here.


class Provider(AbstractUser):
    specialty = models.CharField(max_length = 100)
    availability = models.JSONField()
    prices = models.JSONField()
    location = models.CharField(max_length=255)
    is_approved = models.BooleanField(default=False)
    email = models.EmailField(unique=True, blank=False)  # Enforce email uniqueness
    # class Meta:
    #     db_table = "provider"
    #     app_label = "api"
    #     permissions = ("")
    #TODO: Add user and group persmissions
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='providers',
        verbose_name= "Provider Group"
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='providers_permissions',
        verbose_name= "Provider Permissions",
    )
    # USERNAME_FIELD tells django that the unique identifier should be the email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'specialty', 'location', 'availability', 'prices']




class Customer(AbstractUser):
    location = models.CharField(max_length=255)
    email = models.EmailField(unique=True, blank=False)  # Enforce email uniqueness
    # TODO: Add user and group persmissions
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customers',
        verbose_name= "Customer Group"
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customer_permissions',
        verbose_name= "Customer Permissions",
    )
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'location']

"""
CREATE A META CLASS FOR PERMISSION AND GROUPS"""

