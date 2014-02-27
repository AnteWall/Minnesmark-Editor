from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Routes(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=40)
    active = models.BooleanField(default=False)

class Markers(models.Model):
    route = models.ForeignKey(Routes,null=True)
    latitude = models.DecimalField(max_digits=30, decimal_places=25)
    longitude = models.DecimalField(max_digits=30, decimal_places=25)
    number = models.IntegerField()
    index = models.IntegerField()

class Points(models.Model):
    route = models.ForeignKey(Routes,null=True)
    latitude = models.DecimalField(max_digits=30, decimal_places=25)
    longitude = models.DecimalField(max_digits=30, decimal_places=25)
    index = models.IntegerField()

#class Media:
 #   marker_id = models.ForeignKey(Markers)
  #  path = models.CharField(max_length=256)

