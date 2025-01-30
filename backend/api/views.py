from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from .forms import ProviderSignUpForm, CustomerSignUpForm
from django.contrib.auth import authenticate, login, logout

def register_provider(request):
    if request.method == 'POST':
        form = ProviderSignUpForm(request.POST)
        if form.is_valid():
            form.save()
            # TODO:Handle post-save actions here, like logging user in or redirecting
            # TODO: Change redirect
            return redirect('index')
    else:
        form = ProviderSignUpForm()
    return render(request, 'registration/register_provider.html', {'form': form})

def register_customer(request):
    if request.method == 'POST':
        form = CustomerSignUpForm(request.POST)
        if form.is_valid():
            form.save()
            # TODO:Handle post-save actions here, like logging user in or redirecting
            # TODO: Change redirect
            return redirect('index')
    else:
        form = CustomerSignUpForm()
    return render(request, 'registration/register_customer.html', {'form': form})
#TODO: Remove index - and ad Home page instead
def index(request):
    return render(request, 'index.html')

"""                           Login and Logout Views                             """

#TODO: HAndle Login TOKENS and REfresh Token
def user_login(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            #TODO: Change from index to correct redirect page later
            return redirect('index')
        else:
            #TODO: Add specific/correct login html
            return render(request, 'login.html', {'error': 'invalid login'})
    else:
        #TODO: Add specific/correct login html
        return render(request, 'login.html')

def user_logout(request):
    logout(request)
    #TODO: Redirect to correct login page
    return redirect('login')

#TODO: Reimplement this by adding correct redirect
# @login_required
# @user_passes_test(lambda user: user.is_superuser)
# def admin_dashboard(request):
#     return render(request, 'admin_dashboard.html')
#
# @login_required
# @user_passes_test(lambda user: user.is_provider)
# def provider_dashboard(request):
#     return render(request, 'provider_dashboard.html')
#
# @login_required
# @user_passes_test(lambda user: user.is_customer)
# def customer_dashboard(request):
#     return render(request, 'customer_dashboard.html')
