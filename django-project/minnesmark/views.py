# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

import datetime


#def current_datetime(request):
#    now = datetime.datetime.now()
#    return render(request, 'test/current_datetime.html', {'current_date': now})

def username_validation(username):
    errors = []

    if(username_present(username)):
        errors.append("Användarnamnet finns redan.")
    if(len(username) <= 0):
        errors.append("Användarnamnet måste vara längre än 0 tecken.")

    return errors

def username_present(username):
    if User.objects.filter(username=username).count():
        return True
    return False

def password_validation(pass1,pass2):
    errors = []
    if(pass1 != pass2):
        errors.append("Lösenorden matchade inte.")
    if(len(pass1) < 3):
        errors.append("Lösenordet måste vara längre än 3 bokstäver.")
    
    return errors

def register_account(request):
    if request.method == "POST":
        #array for all error to be displayed if validation fails.
        all_errors = []
        
        #Password Validation
        all_errors.extend(password_validation(request.POST['password'],request.POST['password_again']))
        #Username Validation
        all_errors.extend(username_validation(request.POST['username']))

        if(len(all_errors) <= 0):
            newuser = User.objects.create_user(request.POST["username"],request.POST["email"], request.POST["password"])
            newuser.is_active = False
            newuser.save()
            return render(request,'registration/registration_complete.html')
        else:
            return render(request,'registration/registration_form.html',{'all_errors':all_errors})

    return render(request,'registration/registration_form.html')
