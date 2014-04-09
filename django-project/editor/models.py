from django.db import models

# Create your models here.

#How the media files is stored in the database
class Media(models.Model):
    #station = models.ForeignKey(Stations)
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
