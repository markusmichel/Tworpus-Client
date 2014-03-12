from django.db import models

class Session(models.Model):
    title = models.CharField(max_length=200, unique=True)
    folder = models.CharField(max_length=200)
    minWordsPerTweet = models.IntegerField(default=0)
    minCharsPerTweet = models.IntegerField(default=0)
    numTweets = models.IntegerField(default=0)
    language = models.CharField(max_length=5)
    completed = models.BooleanField(default=False)

    def __unicode__(self):
        return self.title

    def as_json(self):
        return {
            "title": self.title,
            "folder": self.folder,
            "minWordsPerTweet": self.minWordsPerTweet,
            "minCharsPerTweet": self.minCharsPerTweet,
            "numTweets": self.numTweets,
            "language": self.language,
            "completed": self.completed
        }