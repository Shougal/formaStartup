from django.urls import path
from . import views
from .views import RegisterProviderView, RegisterCustomerView, UserLoginView, UserLogoutView, TestProtectedView, ApprovedProvidersView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    #TODO:Change the following index home page
    path('', views.index, name='index'),
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

]