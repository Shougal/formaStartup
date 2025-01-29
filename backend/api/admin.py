from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Provider, Customer

class ProviderAdmin(BaseUserAdmin):
    model = Provider
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('specialty', 'availability', 'prices', 'location', 'is_approved')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'specialty', 'location', 'availability', 'prices', 'is_approved'),
        }),
    )

class CustomerAdmin(BaseUserAdmin):
    model = Customer
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('location',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'location'),
        }),
    )

admin.site.register(Provider, ProviderAdmin)
admin.site.register(Customer, CustomerAdmin)
