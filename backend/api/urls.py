from django.urls import path
from . import views
from .views import RegisterProviderView, RegisterCustomerView, UserLoginView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    #TODO:Change the following index home page
    path('', views.index, name='index'),
    # path('register/provider/', views.register_provider, name='register_provider'),
    # path('register/customer/', views.register_customer, name='register_customer'),
    # path('login/', views.user_login, name='login'),
    # API-based registration
    #TODO: Add name in views.py - meta class
    path('register/provider/', RegisterProviderView.as_view(), name='register_provider'),
    path('register/customer/', RegisterCustomerView.as_view(), name='register_customer'),

    # API-based authentication (JWT-based)
    path('login/', UserLoginView.as_view(), name='user_login'),
    path('logout/', views.user_logout, name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='get_token'),  # Get access & refresh tokens
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),  # Refresh token
]