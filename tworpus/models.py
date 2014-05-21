from django.db import models


class TworpusSettings(models.Model):
    tweets_per_xml = models.IntegerField(default=10000)