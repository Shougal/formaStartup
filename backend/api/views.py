from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
# Creating a simple view that allows us to create a user
# Create your views here.

# Creating a registration form:
#generics.CreateAPIView is a generic view that is built into django
# that will automatically handle creating a new user or a new object
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all() # List of all diff object that will be looked at
    # when creating a new one - to make sure we don't create a user that already exists
    serializer_class = UserSerializer #Serializer class that tells this view what kind of data to accept to
    # make a new user

    # Allowing anyone to use this view to create a new user
    # even if they are not authenticated
    permission_classes = (AllowAny,)