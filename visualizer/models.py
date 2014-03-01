from django.db import models

class Visualization(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    def __unicode__(self):
        return self.title
