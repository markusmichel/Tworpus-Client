import datetime, time
from django.utils.timezone import utc
from django.core.servers.basehttp import FileWrapper
import django
from django.http import HttpResponse
from django import http
import shutil
from uuid import uuid4
from django.template import RequestContext, loader

# csrf: https://docs.djangoproject.com/en/dev/ref/contrib/csrf/#unprotected-view-needs-the-csrf-token
from django.views.decorators.csrf import csrf_exempt, csrf_protect

import json
from django.core import serializers
import os
from StringIO import StringIO
from enum import Enum

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

    Status codes:
    - 409: No tweets found to fetch
    """

    idList = []
    if request.method == 'POST':

        # AJAX request: parse body
        if request.is_ajax():
            data = json.loads(request.body)
            minWordCount = int(data["numMinWords"])
            minCharsCount = int(data["numMinChars"])
            language = str(data["language"])
            numTweets = int(data["numTweets"])
            title = str(data["title"])
            startDate = str(data["startDateTimestamp"])
            endDate = str(data["endDateTimestamp"])

        # "normal" POST request: parse request.POST
        else:
            minWordCount = request.POST["minWords"]
            minCharsCount = request.POST["minChars"]
            language = request.POST["language"]
            numTweets = request.POST["limit"]
            title = request.POST["title"]
            startDate = request.POST["startDateTimestamp"]
            endDate = request.POST["endDateTimestamp"]

        folderName = str(uuid4())
        startDateObj = datetime.datetime.utcfromtimestamp(int(startDate) / 1000).replace(tzinfo=utc)
        endDateObj = datetime.datetime.utcfromtimestamp(int(endDate) / 1000).replace(tzinfo=utc)

        session = Session.objects.create(title=title, startDate=startDateObj, endDate=endDateObj)
        session.language = language
        session.minCharsPerTweet = minCharsCount
        session.minWordsPerTweet = minWordCount
        session.numTweets = numTweets
        session.folder = folderName
        session.save()

        try:
            start_create_corpus(session)
        except CsvEmptyException:
            return HttpResponse(status=444)
        except CsvPartiallyEmptyException:
            return HttpResponse(status=206)

        # Notify corpus creation initialization
        response_data = {}
        response_data['message'] = 'Start fetching tweets'
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        return http.HttpResponseServerError("Error fetching tweets")


def invokeCorpusCreation(csvFile, folder, session):
    """
    fetches tweets by calling fetcher jar
    """
    listener = TweetIO.TweetProgressEventHandler(session.id)
    fetcher = TweetIO.TweetsFetcher(tweetsCsvFile=csvFile.name, outputDir=folder, updateListener=listener)
    fetcher.fetch()

    fetchersManager = TweetIO.getManager()
    fetchersManager.add(fetcher, session.id)


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
        session = Session.objects.all().filter(id=corpusid).first()
        folder = os.path.join(settings.BASE_PROJECT_DIR, session.folder)
        session.delete()

        manager = TweetIO.getManager()
        manager.remove(corpusid)
        shutil.rmtree(folder)
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
    """
    id = request.GET["id"]
    session = Session.objects.all().filter(id=id).first()
    session.working = True
    session.completed = False
    session.save()

    folderPath = os.path.join(settings.BASE_PROJECT_DIR, session.folder)
    csvFile = open(os.path.join(folderPath, "tweets.csv"))

    invokeCorpusCreation(folder=folderPath, csvFile=csvFile, session=session)

    return HttpResponse(json.dumps("success"), status=200)


def downloadCorpus(request):
    id = request.GET["id"]
    session = Session.objects.all().filter(id=id).first()
    tweetsFileLocation = os.path.join(settings.BASE_PROJECT_DIR, session.folder, "tweets.xml")
    tweetsFile = open(tweetsFileLocation)

    response = HttpResponse(FileWrapper(tweetsFile), content_type='application/xml')
    response['Content-Disposition'] = 'attachment; filename=tweets.xml'
    return response


def recreateCorpus(request):
    id = request.GET["id"]
    session = Session.objects.all().filter(id=id).first()
    session.resetProgress()

    try:
        start_create_corpus(session, override=True)
    except CsvEmptyException:
        return HttpResponse(status=409)

    return HttpResponse(json.dumps("success"), status=200)


def start_create_corpus(session, override=False):
    session.working = True
    session.save()

    startDate = str(int((time.mktime(session.startDate.timetuple()))) * 1000)
    endDate = str(int(time.mktime(session.endDate.timetuple())) * 1000)

    # fetch and save csv list
    csv = tworpus_fetcher.getCsvListStr(
        minWordcount=session.minWordsPerTweet, minCharcount=session.minCharsPerTweet,
        language=session.language, limit=session.numTweets,
        startDate=startDate, endDate=endDate
    )

    # status == 444 := no tweets to fetch
    if csv['status'] == 444:
        session.delete()
        raise CsvEmptyException()

    folderName = session.folder
    baseFolder = os.path.join(settings.BASE_PROJECT_DIR, folderName)
    if not os.path.isdir(baseFolder):
        os.makedirs(baseFolder)

    csvFile = open(os.path.join(baseFolder, "tweets.csv"), "w")
    csv['content'] = csv['content'].replace("\r", "")
    csvFile.write(csv['content'])

    invokeCorpusCreation(csvFile=csvFile, session=session, folder=baseFolder)

    # status == 444 := no tweets to fetch
    if csv['status'] == 206:
        raise CsvPartiallyEmptyException

class CsvEmptyException(Exception):
    pass

class CsvPartiallyEmptyException(Exception):
    pass