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