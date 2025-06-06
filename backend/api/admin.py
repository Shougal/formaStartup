from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from .models import Provider, Customer, Availability, CustomerAppointment

class ProviderAdmin(BaseUserAdmin):
    model = Provider
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Provider Info', {'fields': ('specialty', 'availability', 'prices', 'location',
                       'is_approved', 'theme', 'img', 'calendly_link', 'portfolio_link')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Provider Info', {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'specialty', 'availability', 'prices', 'location',
                       'is_approved', 'theme', 'img', 'calendly_link', 'portfolio_link'),
        }),
    )

    def has_module_permission(self, request):
        return request.user.is_superuser  # Only allow superusers

class CustomerAdmin(BaseUserAdmin):
    model = Customer
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Customer Info', {'fields': ('location',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Provider Info', {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'location'),
        }),
    )

    def has_module_permission(self, request):
        return request.user.is_superuser  # Only allow superusers

admin.site.register(Provider, ProviderAdmin)
admin.site.register(Customer, CustomerAdmin)

# Hide Groups from the admin panel
admin.site.unregister(Group)

# Register availability in admin page
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ('provider', 'day', 'time_slots')  # Customize to display these fields in the admin list view
    list_filter = ('day',)  # Enable filtering by day
    search_fields = ('provider__username', 'day')  # Enable search by provider's username and day

admin.site.register(Availability, AvailabilityAdmin)


class CustomerAppointmentAdmin(admin.ModelAdmin):
    list_display = ('customer', 'provider', 'date', 'time', 'created_at')
    list_filter = ('provider', 'customer', 'date')
    search_fields = ('customer__username', 'provider__username')


admin.site.register(CustomerAppointment, CustomerAppointmentAdmin)