from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Provider, Customer

class ProviderSignUpForm(UserCreationForm):
    class Meta:
        model = Provider
        fields = ['email', 'username', 'password1', 'password2', 'specialty', 'availability', 'prices']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_provider = True
        user.is_customer = False
        if commit:
            user.save()
        return user

class CustomerSignUpForm(UserCreationForm):
    class Meta:
        model = Customer
        fields = ['email', 'username', 'password1', 'password2', 'location']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_customer = True
        user.is_provider = False
        if commit:
            user.save()
        return user
