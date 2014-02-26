from django.db import models
from django.contrib.auth.models import User

# Create your models here.

#TODO NOT NULL FIELDS!

class Routes(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=40)

class Markers(models.Model):
    route = models.ForeignKey(Routes)
    latitude = models.IntegerField()
    longitude = models.IntegerField()
    number = models.IntegerField()
    index = models.IntegerField()

class Points(models.Model):
    route = models.ForeignKey(Routes)
    latitude = models.IntegerField()
    longitude = models.IntegerField()
    index = models.IntegerField()

#class Media:
 #   marker_id = models.ForeignKey(Markers)
  #  path = models.CharField(max_length=256)

