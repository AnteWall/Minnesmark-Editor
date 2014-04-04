from django.db import models
from django.contrib.auth.models import User

# Create your models here.
# Update database with 'manage.py syncdb'.

# Route tables
class Routes(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=40)
    active = models.BooleanField(default=False)

class Stations(models.Model):
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

# Media tables

class Media(models.Model):
    station = models.ForeignKey(Stations)
    name = models.CharField(max_length=40)
    filepath = models.CharField(max_length=256)
    size = models.IntegerField()
    treasure = models.BooleanField(default=False)

    FILEOPTIONS = {
        (1, 'panorama'),
        (2, 'camera_bg'),
        (3, 'fullscreen')
    }

    options = models.IntegerField(choices=FILEOPTIONS,null=True)

    @classmethod
    def create_media(cls, name, filepath, size, treasure):
        media = cls(name=name, filepath=filepath, size=size, treasure=treasure)
        return media


class MediaTypes(models.Model):
    media = models.ForeignKey(Media)
    category = models.CharField(max_length=20)


class FileTypes(models.Model):
    media = models.ForeignKey(MediaTypes)
    filetype = models.CharField(max_length=40)
