from django.shortcuts import render
from django.shortcuts import render_to_response, RequestContext
import tworpus_user_id
from django.http import HttpResponse

from session.models import Session
import json


def home(request):
    id = tworpus_user_id.getUid()
    return render_to_response("base.html", {"sid": str(id)}, context_instance=RequestContext(request))