from django.urls import path
from . import views
from .views import RegisterProviderView, RegisterCustomerView, UserLoginView, UserLogoutView, TestProtectedView, ApprovedProvidersView, ChangePasswordView, AvailabilityList, AvailabilityDetail, ProviderAvailabilityView, BookAppointmentView, CustomerAppointmentsList, ProviderAppointmentsList
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [

    # API-based registration
    #TODO: Add name in views.py - meta class
    path('register/provider/', RegisterProviderView.as_view(), name='register_provider'),
    path('register/customer/', RegisterCustomerView.as_view(), name='register_customer'),

    # API-based authentication (JWT-based)
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='get_token'),  # Get access & refresh tokens
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),  # Refresh token
    path('test-protected/', TestProtectedView.as_view(), name='test-protected'),
    path('approved-providers/<str:specialty>/', ApprovedProvidersView.as_view(), name='approved_providers'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('availability/', AvailabilityList.as_view(), name='availability-list'),
    path('availability/<int:pk>/', AvailabilityDetail.as_view(), name='availability-detail'),
    path('availability/provider/<int:provider_id>/', ProviderAvailabilityView.as_view(), name='provider-availability'),
    path('appointments/book/', BookAppointmentView.as_view(), name='book-appointment'),
    path('appointments/customer/', CustomerAppointmentsList.as_view(), name='customer-appointments'),
    path('appointments/provider/', ProviderAppointmentsList.as_view(), name='provider-appointments'),

]