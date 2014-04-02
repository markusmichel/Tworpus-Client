from django.shortcuts import render_to_response, RequestContext
from django.http import HttpResponse
import tworpus_user_id
from models import TworpusSettings
import json


def home(request):
    request.META["CSRF_COOKIE_USED"] = True
    id = tworpus_user_id.getUid()
    return render_to_response("base.html", {"sid": str(id)}, context_instance=RequestContext(request))

def set_tweets_per_xml(request):

    if request.is_ajax():
        values = json.loads(request.body)
        tweets_per_xml = values["tweets_per_xml"]
        tw_settings = TworpusSettings.objects.first()
        tw_settings.tweets_per_xml = tweets_per_xml
        tw_settings.save()

    return HttpResponse("success")

def get_tweets_per_xml(request):
    tw_settings = TworpusSettings.objects.first()

    return HttpResponse(json.dumps({"tweets_per_xml": tw_settings.tweets_per_xml}))