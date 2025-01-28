# #from django.contrib.auth.models import User
# from rest_framework import serializers
# from .models import User, Provider
# from django.contrib.auth import get_user_model
#
# # I will be giving and returning json data so I need
# # a serializers to convert json data into python equivalent code
# # and vice-versa
#
# User = get_user_model()
#
# class UserSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, style={'input_type': 'password'})
#     class Meta:
#         model = User
#         fields = ('id', 'username', 'email', 'password', 'location', 'createdAt')
#         extra_kwargs = {
#             'password': {'write_only': True, 'style': {'input_type': 'password'}},
#         }
#
#     def create(self, validated_data):
#         user = User.objects.create_user(
#             username=validated_data['username'],
#             email=validated_data['email'],
#             password=validated_data['password'],
#             location=validated_data['location']
#         )
#         return user
#
# class ProviderSerializer(UserSerializer):
#     class Meta(UserSerializer.Meta):
#         model = Provider
#         fields = UserSerializer.Meta.fields + ('availability', 'price', 'portfolio_link', 'speciality')