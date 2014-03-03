from Carbon import File
from django.http import HttpResponse
from django import http
from django.template import RequestContext, loader

# csrf: https://docs.djangoproject.com/en/dev/ref/contrib/csrf/#unprotected-view-needs-the-csrf-token
from django.views.decorators.csrf import csrf_exempt, csrf_protect

import json
import uuid
from django.core import serializers
import urllib2
import urllib
import httplib
import os
from StringIO import StringIO
from enum import Enum

import Twitter


# Current progress of corpus creation
progress = -1
isWorking = False

class Task(Enum):
    idle = 0
    fetching = 1
    saving = 2

class TweetFetcherController(Twitter.TwitterFetcherProgressListener):

    __id = None
    fetcher = None
    isWorking = False
    progress = None

    def __init__(self):
        id = uuid.uuid4()
        self.__id = id
        print id

        self.__initProgress()

    def __initProgress(self):
        status = {}
        status["currentStep"] = 0
        status["working"]     = self.isWorking()

        status["steps"] = []
        status["steps"].append({})
        status["steps"].append({})
        self.__progress = status

        # Number of tweets saved to file
        self.__numSaved = 0
        self.__currentTask = Task.idle

    def getId(self):
        return self.__id

    def createCorpus(self, ids):
        # @TODO: check if is still/already working
        twitterfetcher = Twitter.TweetsFetcher(self)

        self.__initProgress()
        self.__currentTask = Task.fetching

        twitterfetcher.fetchTweets(ids)
        self.fetcher = twitterfetcher

    def isWorking(self):
        # @TODO use self.__currentTask is Tak.fetching instead
        # @TODO method not correct
        isWorking = self.fetcher.isWorking() if self.fetcher is not None else False
        return isWorking

    def getProgress(self):
        status = self.__progress

        status["working"]     = self.isWorking()
        status["task"]        = self.__currentTask
        #status["taskName"]    = self.__currentTask.name

        status["steps"][0]["numFetched"] = self.numSuccessfullTweets
        status["steps"][0]["numFailed"]  = self.numFailedTweets
        status["steps"][0]["numTotal"]   = self.numTotalTweets

        status["steps"][1]["numTotal"]   =  self.numSuccessfullTweets
        status["steps"][1]["numSaved"]   =  self.__numSaved

        return status

    def onStart(self):
        pass

    def onProgress(self):
        """
        One tweet was fetched, no matter if it was successfull or not.
        """
        global progress
        progress = self.fetcher.getProgress()
        #print "progress changed to " + str(progress)

        # Notify client view NodeJS / Socket.io and Tworpus REST Api
        url = "http://localhost:3000/api/v1/sockets/emit/" + str(controller.getId())
        urlQuery = "/api/v1/sockets/emit/progress/" + str(controller.getId())

        io = StringIO()
        statusJsonString = json.dumps(controller.getProgress(), io)
        data = {}
        data["status"] = statusJsonString
        statusJsonString = urllib.urlencode(data)

        httpConn = httplib.HTTPConnection('localhost:3000')
        headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
        httpConn.request('POST', urlQuery, statusJsonString, headers)
        #response = httpConn.getresponse()

    def onFinish(self):
        """
        All tweets have beed fetched.
        All = successfull + failed tweets.
        """
        global progress, isWorking
        progress = 100

        # @TODO: wrap in thread
        self.reportFailedTweets()

        folder = "projects" + os.sep + "test"
        self.saveSuccessfullTweets(filename="tweets.json", folder=folder)

        print "successful tweets = " + str(self.numSuccessfullTweets)
        print "failed tweets = " + str(self.numFailedTweets)
        print "Download finished"

    def reportFailedTweets(self):
        failedtweets = self.failedTweets
        for tweet in failedtweets:
            print tweet
            url = "http://localhost:3000/api/v1/unavailable?tweetid=" + str(tweet["id"]) + "&userid=" + str(tweet["userid"])
            print url
            response = urllib2.urlopen(url)

    def saveSuccessfullTweets(self, filename="tweets.json", folder="projects/test"):
        """
        Saves all successfully fetched tweets to a json file
        """
        self.__currentTask = Task.saving

        if not os.path.exists(folder):
            os.makedirs(folder)

        arr = []
        for tweet in self.successfullTweets:
            t = {}
            t["chars"]      = tweet.chars
            t["words"]      = tweet.words
            t["fullName"]   = tweet.fullName
            t["screenName"] = tweet.screenName
            t["text"]       = tweet.text
            t["tweetId"]    = tweet.tweetId
            t["userId"]     = tweet.userId
            arr.append(t)

            self.__numSaved += 1
            self.onProgress()

        str = json.dumps(arr)

        f = open(folder + "/" + filename, "w+")
        json.dump(arr, f, ensure_ascii=True)
        f.close()


controller = TweetFetcherController()


def createCorpus(request):
    template = loader.get_template('create_corpus.html')
    context = RequestContext(request, {
        "sid": controller.getId()
    })

    global controller
    print "working" if controller.isWorking() else "IDLE"

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
    global controller

    if(controller.isWorking()):
        status = {}
        status["message"] = "Kann keine weiteren Tweets herunterladen, da momentan schon eine Session erstellt wird. Bitte warten."
        status["working"] = True
        return HttpResponse(json.dumps(status), content_type="application/json")
        #return http.HttpResponseServerError("Cannot fetch more tweets because fetcher is still active. Please wait.")

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

    controller.createCorpus(idList)

    response_data = {}
    response_data['message'] = 'Start fetching tweets'
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def checkCorpusCreationProgress(request):
    response_data = createStatusObject()
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def createStatusObject():
    global controller
    return controller.getProgress()


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
