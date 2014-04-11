from _ast import Dict
from django.db import models
from django.contrib.auth.models import User

# Create your models here.
# Update database with 'manage.py syncdb'.

# Route tables
class Route(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=40,default="Ny Rutt")
    published = models.BooleanField(default=False)

class Station(models.Model):
    route = models.ForeignKey(Route, null=True)
    number = models.IntegerField()
    index = models.IntegerField()
    latitude = models.DecimalField(max_digits=30, decimal_places=25)
    longitude = models.DecimalField(max_digits=30, decimal_places=25)

    def as_json(self):
        return dict(
            number=self.number,
            index=self.index,
            latitude=float(self.latitude),
            longitude=float(self.longitude)
        )


class Polyline(models.Model):
    route = models.ForeignKey(Route, null=True)
    index = models.IntegerField()
    latitude = models.DecimalField(max_digits=30, decimal_places=25)
    longitude = models.DecimalField(max_digits=30, decimal_places=25)

    def as_json(self):
        return dict(
            index=self.index,
            latitude=float(self.latitude),
            longitude=float(self.longitude)
        )

# Media tables

class Media(models.Model):
    station = models.ForeignKey(Station)
    filename = models.CharField(max_length=40)
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
