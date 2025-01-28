from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Provider, Customer

class ProviderSignUpForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = Provider
        fields = ['email', 'username', 'specialty', 'location', 'availability', 'prices']

class CustomerSignUpForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = Customer
        fields = ['email', 'username', 'location']
