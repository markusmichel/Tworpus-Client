from django.shortcuts import render_to_response, RequestContext
from django.http import HttpResponse, Http404
import tworpus_user_id
from models import TworpusSettings
import json
import data_converter
from tworpus import settings


def home(request):
    request.META["CSRF_COOKIE_USED"] = True
    return render_to_response("base.html", {}, context_instance=RequestContext(request))


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


def converters_list(request):
    converters = data_converter.get_converter_data()
    return HttpResponse(json.dumps(converters))

def static(request):
    import os.path
    import mimetypes
    path = request.get_full_path().replace("/st", "", 1).split("/")
    full_path = os.path.join(settings.BASE_DIR, "tworpus", "static")

    for p in path:
        full_path = os.path.join(full_path, p)

    if os.path.isfile(full_path) is False:
        raise Http404

    file = open(full_path, "rb")
    mimetype = mimetypes.guess_type(full_path)

    return HttpResponse(file, mimetype=mimetype[0])
