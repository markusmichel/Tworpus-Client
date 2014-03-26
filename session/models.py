from django.db import models
from datetime import datetime

class Session(models.Model):
    title = models.CharField(max_length=200, unique=False)
    folder = models.CharField(max_length=200)
    minWordsPerTweet = models.IntegerField(default=0)
    minCharsPerTweet = models.IntegerField(default=0)
    numTweets = models.IntegerField(default=0)
    language = models.CharField(max_length=5)
    created = models.DateTimeField(auto_now_add=True)

    # actual tweet numbers
    tweetsFetched = models.IntegerField(default=0)
    tweetsFailed  = models.IntegerField(default=0)

    # progress indicators
    working = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    progress = models.FloatField(default=0) #progress in percent

    def __unicode__(self):
        return self.title

    def as_json(self):
        return {
            "id": self.id,
            "title": self.title,
            "folder": self.folder,
            "minWordsPerTweet": self.minWordsPerTweet,
            "minCharsPerTweet": self.minCharsPerTweet,
            "numTweets": self.numTweets,
            "language": self.language,
            "completed": self.completed,
            "created": self.created.isoformat(),
            "progress": self.progress,
            "working": self.working,
            "tweetsFetched": self.tweetsFetched,
            "tweetsFailed": self.tweetsFailed
        }