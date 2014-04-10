from django.contrib.auth.models import User
from django.db import models

# Route tables
class Route(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=40)
    published = models.BooleanField(default=False)

class Station(models.Model):
    route = models.ForeignKey(Route, null=True)
    number = models.IntegerField()
    index = models.IntegerField()

class Polyline(models.Model):
    route = models.ForeignKey(Route, null=True)
    index = models.IntegerField()
    latitude = models.DecimalField(max_digits=30, decimal_places=25)
    longitude = models.DecimalField(max_digits=30, decimal_places=25)

# Media tables
class Media(models.Model):
    route = models.ForeignKey(Route)
    station = models.ForeignKey(Station,null=True)
    filename = models.CharField(max_length=256)
    filepath = models.CharField(max_length=256)
    size = models.IntegerField()
    treasure = models.BooleanField(default=False)
    order = models.IntegerField()

    PANORAMA = 1
    CAMERA_BG = 2
    FULLSCREEN = 3
    FILE_OPTIONS = {
        (PANORAMA, 1),
        (CAMERA_BG, 2),
        (FULLSCREEN, 3)
    }

    options = models.IntegerField(choices=FILE_OPTIONS, null=True)

    STARTMEDIA = 1
    STATION_MEDIA = 2
    AR_MEDIA = 3
    media_type = {
        (STARTMEDIA, 1),
        (STATION_MEDIA, 2),
        (AR_MEDIA, 3)
    }
    mediatype = models.IntegerField(choices=media_type, null=False)

    def as_json(self):
        return dict(
            id=self.id,
            name=self.filename,
            filepath=self.filepath,
            size=self.size,
            treasure=self.treasure,
            options=self.options,
            user=self.user
        )

    user = models.ForeignKey(User, related_name='media_user')


class MediaType(models.Model):
    media = models.ForeignKey(Media,related_name='mediatype_media')
    category = models.CharField(max_length=20)


class FileType(models.Model):
    media = models.ForeignKey(MediaType)
    file_type = models.CharField(max_length=40)
