from django.shortcuts import render, redirect
from .forms import ProviderSignUpForm, CustomerSignUpForm

def register_provider(request):
    if request.method == 'POST':
        form = ProviderSignUpForm(request.POST)
        if form.is_valid():
            provider = form.save()
            #TODO:Handle post-save actions here, like logging user in or redirecting
            return redirect('index')
    else:
        form = ProviderSignUpForm()
    return render(request, 'registration/register_provider.html', {'form': form})

def register_customer(request):
    if request.method == 'POST':
        form = CustomerSignUpForm(request.POST)
        if form.is_valid():
            customer = form.save()
            # TODO:Handle post-save actions here
            return redirect('index')
    else:
        form = CustomerSignUpForm()
    return render(request, 'registration/register_customer.html', {'form': form})


def index(request):
    return render(request, 'index.html')



# from rest_framework import status
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from .serializers import UserSerializer, ProviderSerializer
# from rest_framework.permissions import AllowAny
#
# class CustomerRegistration(APIView):
#     permission_classes = [AllowAny]
#
#     def get(self, request, *args, **kwargs):
#         serializer = UserSerializer()  # No data is passed, so an empty form is initialized
#         return Response(serializer.data)  # Returns a Response with serializer data, which DRF uses to render the form
#
#     def post(self, request):
#         serializer = UserSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
# class ProviderRegistration(APIView):
#     def post(self, request):
#         serializer = ProviderSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#
#
#
# # from django.shortcuts import render
# # from django.contrib.auth.models import User
# # from rest_framework import generics
# # from .serializers import UserSerializer
# # from rest_framework.permissions import IsAuthenticated, AllowAny
# # # Creating a simple view that allows us to create a user
# # # Create your views here.
# #
# # # Creating a registration form:
# # #generics.CreateAPIView is a generic view that is built into django
# # # that will automatically handle creating a new user or a new object
# # class CreateUserView(generics.CreateAPIView):
# #     queryset = User.objects.all() # List of all diff object that will be looked at
# #     # when creating a new one - to make sure we don't create a user that already exists
# #     serializer_class = UserSerializer #Serializer class that tells this view what kind of data to accept to
# #     # make a new user
# #
# #     # Allowing anyone to use this view to create a new user
# #     # even if they are not authenticated
# #     permission_classes = (AllowAny,)