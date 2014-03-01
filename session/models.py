from django.db import models

class Session(models.Model):
    _id = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    minWordsPerTweet = models.IntegerField(default=0)
    minCharsPerTweet = models.IntegerField(default=0)
    numTweets = models.IntegerField(default=0)
    language = models.CharField(max_length=5)

