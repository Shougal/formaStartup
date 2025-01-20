from django.contrib.auth.models import User
from rest_framework import serializers

# I will be giving and returning json data so I need
# a serializers to convert json data into python equivalent code
# and vice-versa

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User # serializing the user model
        # These are all the fields that we will be accepting from the user
        #Customers in this case
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}} #Don't return password as user data

        # Implementing a method that will be called when creating
        # a new version of this user
        # validated_data is what the serializer validates when
        #looking the model (User in this case) and its fields
        #It then checks if the fields are valid
        def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            return user
