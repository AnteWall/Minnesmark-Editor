# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

import datetime


#def current_datetime(request):
#    now = datetime.datetime.now()
#    return render(request, 'test/current_datetime.html', {'current_date': now})

def register_account(request):
    if request.method == "POST":
        print(request.POST["username"])
        newuser = User.objects.create_user(request.POST["username"],request.POST["email"], request.POST["password"])
        newuser.is_active = False
        newuser.save()
        return render(request,'registration/registration_complete.html')
    
    return render(request,'registration/registration_form.html')
