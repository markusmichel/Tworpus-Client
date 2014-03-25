import django
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

def createCorpusContent(request):
    """
    Returns just the content for corpus creation.
    Used for angular.js route /views/createcorpus
    """
    from django.shortcuts import render_to_response
    return render_to_response("create_corpus_content.html")



class TweetsDownloadListener(TweetIO.FetcherProgressListener):
    def onSuccess(self):
        pass

    def onError(self):
        pass

    def onFinish(self):
        pass

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
    (_check_) Notify client that there's a work in progress
    """

    idList = []
    if request.method == 'POST':
        print request.body
        values = json.loads(request.body)
        print values["title"]

        import uuid
        title = str(uuid.uuid4())

        # AJAX request: parse body
        if request.is_ajax():
            data = json.loads(request.body)
            minWordCount  = int(data["numMinWords"])
            minCharsCount = int(data["numMinChars"])
            language      = str(data["language"])
            numTweets     = int(data["numTweets"])
            title         = int(data["title"])

        # "normal" POST request: parse request.POST
        else:
            minWordCount  = request.POST["minWords"]
            minCharsCount = request.POST["minChars"]
            language      = request.POST["language"]
            numTweets     = request.POST["limit"]
            title         = request.POST["limit"]

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
        session.working = True
        session.save()

        # fetch and save csv list
        csv = tworpus_fetcher.getCsvListStr(minWordcount=minWordCount, minCharcount=minCharsCount, language=language, limit=numTweets)
        csvFile = open(os.path.join(baseFolder, "tweets.csv"), "w")
        csvFile.write(csv)
        csvFilePath = csvFile.name

        ## Throw error if there are no tweets to fetch
        #if(len(idList) == 0):
        #    return http.HttpResponseServerError("Error fetching tweets")

        # @TODO: create own reusable method (i.e. when resuming a creation progress)
        # fetches tweets by calling fetcher jar
        listener = TweetIO.TweetProgressEventHandler(session.id)
        fetcher = TweetIO.TweetsFetcher(tweetsCsvFile=csvFile.name, outputDir=baseFolder, updateListener=listener)
        fetcher.fetch()
        # @TODO: XML directory watcher

        fetchersManager = TweetIO.getManager()
        fetchersManager.add(fetcher, session.id)

        # Notify corpus creation initialization
        response_data = {}
        response_data['message'] = 'Start fetching tweets'
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        return http.HttpResponseServerError("Error fetching tweets")

def getSessions(request):
    """
    Returns a list of all sessions (completed, working, active/inactive).
    """
    sessions = [session.as_json() for session in Session.objects.all()]
    return HttpResponse(json.dumps(sessions))

def getActiveSessions(request):
    """
    Returns a list of corpus creations in progress (currently working or already finished).
    """
    sessions = [session.as_json() for session in Session.objects.all().filter(completed=False)]
    return HttpResponse(json.dumps(sessions))

#-------------------------------------------------------
# Corpus CRUD operations
#-------------------------------------------------------

def getSession(request):
    """
    Return one specific session by its id
    """
    id = int(request.GET["id"])
    session = Session.objects.all().filter(id=id).first()

    return HttpResponse(json.dumps(session.as_json()))

def removeCorpus(request):
    """
    Deletes an finished or unfinished corpus from the database
    and removes all downloaded files.
    """
    from django.core.exceptions import ValidationError
    corpusid = None
    try:
        corpusid = request.GET["corpusid"] if request.method == "GET" else request.POST["corpusid"]
        Session.objects.all().filter(id=corpusid).delete()
    except:
        # Title not found
        return HttpResponse(status=400)

    return HttpResponse(json.dumps(corpusid))

def pauseCorpus(request):
    """
    Sets the corpus with a specific corpusid to NOT working
    and cancels its' running subprocesses.
    """
    id = request.GET["id"]

    fetchersManager = TweetIO.getManager()
    fetchersManager.remove(id)

    session = Session.objects.all().filter(id=id).first()
    session.working = False
    session.save()

    return HttpResponse(json.dumps("success"), status=200)

def resumeCorpus(request):
    """
    Resumes (=restarting subprocess) a corpus creation process.
    @TODO: Assert that XML files won't be overridden.
    @TODO: Check on which step to resume
    """
    pass
