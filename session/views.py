from Carbon import File
from django.http import HttpResponse
from django import http
from django.template import RequestContext, loader

# csrf: https://docs.djangoproject.com/en/dev/ref/contrib/csrf/#unprotected-view-needs-the-csrf-token
from django.views.decorators.csrf import csrf_exempt, csrf_protect

import json
from django.core import serializers

import Twitter

import urllib2

# Current progress of corpus creation
progress = -1
isWorking = False


def createCorpus(request):
    template = loader.get_template('create_corpus.html')
    context = RequestContext(request, {

    })
    listener = ProgressListener()
    ids = Twitter.TweetsFetcher.getTweetIdList()
    #fetcher = Twitter.TweetsFetcher(listener)
    #fetcher.fetchTweets(ids)
    #for id in ids:
    #    tweetId = str(id["tweet_id"])
    #    userId = str(id["userid"])
    #    Twitter.TweetFetcher.fetchTweet(tweetId, userId)

    return HttpResponse(template.render(context))


@csrf_exempt
def startCreateCorpus(request):
    """
    Actually start to create a corpus
    - save values as a model (Session) to the database
    - download information file from tworpus server
    - fetch actual tweets from twitter
    """

    # Reset progress
    global progress, isWorking

    if(isWorking == True):
        status = createStatusObject()
        return HttpResponse(json.dumps(status))

    progress = 0
    idList = []
    if request.method == 'POST':
        title  = request.POST["title"]
        minWordCount  = request.POST["minWords"]
        minCharsCount = request.POST["minChars"]
        language = request.POST["language"]
        numTweets = request.POST["limit"]

        # fetch tweet metadata from tworpus server
        idList = Twitter.TweetsFetcher.getTweetIdList(wordcount=minWordCount, charcount=minCharsCount, language=language, limit=numTweets)
    else:
        idList = Twitter.TweetsFetcher.getTweetIdList()

    # Throw error if there are no tweets to fetch
    if(len(idList) == 0):
        return http.HttpResponseServerError("Error fetching tweets")

    listener = ProgressListener()
    twitterfetcher = Twitter.TweetsFetcher(listener)
    twitterfetcher.fetchTweets(idList)
    isWorking = True

    response_data = {}
    response_data['message'] = 'Start fetching tweets'
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def checkCorpusCreationProgress(request):
    response_data = createStatusObject()
    print response_data
    #print "progress = " + response_data
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def createStatusObject():
    global progress, isWorking
    status = {}
    status['progress'] = progress
    status['working']  = isWorking
    return status


class ProgressListener(Twitter.TwitterFetcherProgressListener):
    """
    Callback for corpus creation progress events.
    """
    def onProgress(self, data):
        global progress
        progress = data
        print "progress changed to " + str(progress)

    def onFinish(self):
        global progress, isWorking
        progress = 100
        isWorking = False
        print "successful tweets = " + str(self.numSuccessfullTweets)
        print "failed tweets = " + str(self.numFailedTweets)
        print "Download finished"
