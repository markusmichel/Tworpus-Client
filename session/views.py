from Carbon import File
from django.http import HttpResponse
from django import http
from django.template import RequestContext, loader

# csrf: https://docs.djangoproject.com/en/dev/ref/contrib/csrf/#unprotected-view-needs-the-csrf-token
from django.views.decorators.csrf import csrf_exempt, csrf_protect

import json
from django.core import serializers
import os
from StringIO import StringIO
from enum import Enum

import Twitter
import tworpus_fetcher
from tworpus import settings as settings
from django import forms
from django.shortcuts import render
import TweetIO

from session.models import Session

# Current progress of corpus creation
progress = -1
isWorking = False

class Task(Enum):
    idle = 0
    fetching = 1
    saving = 2

class CreateCorpusForm(forms.Form):
    subject = forms.CharField(max_length=100)
    message = forms.CharField()
    sender = forms.EmailField()
    cc_myself = forms.BooleanField(required=False)
    language = forms.ChoiceField(widget=forms.ChoiceField())


def createCorpus(request):
    global controller
    print "working" if controller.isWorking() else "IDLE"

    return render(request)

def createCorpusContent(request):
    """
    Returns just the content for corpus creation.
    Used for angular.js route /views/createcorpus
    """
    from django.shortcuts import render_to_response
    return render_to_response("create_corpus_content.html")


def startCreateCorpus_form_errors(request):
    title  = request.POST["title"]
    minWordCount  = request.POST["minWords"]
    minCharsCount = request.POST["minChars"]
    language = request.POST["language"]
    numTweets = request.POST["limit"]

    errors = []
    errors.append("title")

@csrf_exempt
def startCreateCorpus(request):
    """
    Actually start to create a corpus
    - save values as a model (Session) to the database
    - download information file from tworpus server
    - fetch actual tweets from twitter

    (_check_) check if project title is unique
    @TODO: check if there is already a creation in progress and throw error if so
    (_check_) Fetch tweets from TWORPUS as CVS
    (_check_) Save CSV in local project folder
    @TODO: Maybe delete CSV file after creation progress
    (_check) Start tworpus_fetcher.jar to start fetching tweets
    @TODO: Notify client that there's a work in progress
    """


    # Reset progress
    #global controller

    #if(controller.isWorking()):
    #    status = {}
    #    status["message"] = "Kann keine weiteren Tweets herunterladen, da momentan schon eine Session erstellt wird. Bitte warten."
    #    status["working"] = True
    #    return HttpResponse(json.dumps(status), content_type="application/json")
    #    #return http.HttpResponseServerError("Cannot fetch more tweets because fetcher is still active. Please wait.")

    idList = []
    if request.method == 'POST':

        title  = request.POST["title"]
        minWordCount  = request.POST["minWords"]
        minCharsCount = request.POST["minChars"]
        language = request.POST["language"]
        numTweets = request.POST["limit"]

        # @TODO: validation
        #errors = startCreateCorpus_form_errors(request)
        #if len(errors) > 0:
        #    return http.HttpResponseServerError()

        # create project folder
        folderName = title #@TODO change foldername
        baseFolder = settings.BASE_PROJECT_DIR + os.sep + folderName
        xmlFolder = baseFolder + os.sep + "xml"
        if not os.path.isdir(xmlFolder):
            os.makedirs(xmlFolder)

        # save values to database
        session = Session.objects.create(title=title)
        session.language = language
        session.minCharsPerTweet = minCharsCount
        session.minWordsPerTweet = minWordCount
        session.numTweets = numTweets
        session.folder = folderName
        session.save()

        # fetch and save csv list
        csv = tworpus_fetcher.getCsvListStr(minWordcount=minWordCount, minCharcount=minCharsCount, language=language, limit=numTweets)
        # csvArr = csv.split('\n')
        # if len(csvArr) > 0:
        #     del csvArr[0]
        # csv = '\n'.join(csvArr)
        csvFile = open(baseFolder + os.sep + "tweets.csv", "w")
        csvFile.write(csv)
        csvFilePath = csvFile.name

        ## Throw error if there are no tweets to fetch
        #if(len(idList) == 0):
        #    return http.HttpResponseServerError("Error fetching tweets")

        # @TODO: create own reusable method (i.e. wen resuming a creation progress)
        # fetches tweets by calling fetcher jar
        fetcher = TweetIO.TweetsFetcher(tweetsCsvFile=csvFile.name, outputDir=baseFolder)
        fetcher.fetch()
        # @TODO: XML directory watcher

        # Notify corpus creation initialization
        response_data = {}
        response_data['message'] = 'Start fetching tweets'
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        return http.HttpResponseServerError("Error fetching tweets")


@csrf_exempt
def checkCorpusCreationProgress(request):
    """
    @TODO: return a list of current creations in progress
    """
    response_data = {}
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def getActiveSessions(request):
    """
    Returns a list of corpus creations in progress (currently working or already finished).
    """
    activeSessionsObjects = Session.objects.all().filter(completed=False)
    activeSessionList = []

    for activeSession in activeSessionsObjects:
        activeSessionList.append(activeSession.as_json())

    return HttpResponse(json.dumps(activeSessionList))