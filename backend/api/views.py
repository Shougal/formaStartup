from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from .forms import ProviderSignUpForm, CustomerSignUpForm

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

"""TODO: Reimplement this by adding correct redirect"""
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
