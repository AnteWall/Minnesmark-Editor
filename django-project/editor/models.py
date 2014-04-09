from django.db import models

# Create your models here.
class Media(models.Model):
    #station = models.ForeignKey(Stations)
    name = models.CharField(max_length=40)
    filepath = models.CharField(max_length=256)
    size = models.IntegerField()
    treasure = models.BooleanField(default=False)

    PANORAMA = 1
    CAMERA_BG = 2
    FULLSCREEN = 3
    FILE_OPTIONS = {
        (PANORAMA,1),
        (CAMERA_BG,2),
        (FULLSCREEN,3)
    }

    options = models.IntegerField(choices=FILE_OPTIONS,null=True)

    STARTMEDIA = 1
    STATION_MEDIA = 2
    AR_MEDIA = 3
    media_type = {
        (STARTMEDIA, 1),
        (STATION_MEDIA, 2),
        (AR_MEDIA, 3)
    }
    mediatype= models.IntegerField(choices=media_type,null=False)

    def as_json(self):
        return dict(
            name=self.name,
            filepath = self.filepath,
            size =self.size,
            treasure=self.treasure,
            options=self.options
        )


class MediaTypes(models.Model):
    media = models.ForeignKey(Media)
    category = models.CharField(max_length=20)


class FileTypes(models.Model):
    media = models.ForeignKey(MediaTypes)
    filetype = models.CharField(max_length=40)