from django.urls import path
from . import views


urlpatterns = [
    #TODO:Change the following index home page
    path('', views.index, name='index'),
    path('register/provider/', views.register_provider, name='register_provider'),
    path('register/customer/', views.register_customer, name='register_customer'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
]