"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse
from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache


# from api.views import CustomerRegistration, ProviderRegistration
#TODO: Remove index
# from api.views import register_provider, register_customer, index

# THESE VIEWS ARE PREBUILT VIEWS THAT ALLOWS TO ACCESS OUR ACCESS AND REFRESH TOKENS
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def favicon_view(request):
    return HttpResponse(status=204)

urlpatterns = [
    path('favicon.ico', favicon_view),
    path('admin/', admin.site.urls),
    # path('api/token/', TokenObtainPairView.as_view(), name="get_token"),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name="refresh"),
    #TODO: api-auth?
    path('api/auth/', include('rest_framework.urls')),
    path('api/', include('backend.api.urls')),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    path('', never_cache(TemplateView.as_view(template_name="index.html")), name='home'),
    # path('', TemplateView.as_view(template_name="index.html")),
]
