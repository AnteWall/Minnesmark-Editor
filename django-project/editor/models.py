from django.db import models
from django.contrib.auth.models import User

# Create your models here.
# Update database with 'manage.py syncdb'.

class Routes(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=40)
    active = models.BooleanField(default=False)

class Markers(models.Model):
    route = models.ForeignKey(Routes, null=True)
    latitude = models.DecimalField(max_digits=30, decimal_places=25)
    longitude = models.DecimalField(max_digits=30, decimal_places=25)
    number = models.IntegerField()
    index = models.IntegerField()

class Points(models.Model):
    route = models.ForeignKey(Routes, null=True)
    latitude = models.DecimalField(max_digits=30, decimal_places=25)
    longitude = models.DecimalField(max_digits=30, decimal_places=25)
    index = models.IntegerField()

class Media(models.Model):
    marker = models.ForeignKey(Markers)
    name = models.CharField(max_length=40)
    path = models.CharField(max_length=256)
    size = models.IntegerField()
    treasure = models.BooleanField(default=False)
    panorama = models.BooleanField(default=False)

class Media_Types(models.Model):
    media = models.ForeignKey(Media)
    category = models.CharField(max_length=20)
    filetypes = models.CharField(max_length=255)
    options = models.CharField(max_length=255)