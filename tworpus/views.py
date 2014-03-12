from django.shortcuts import render
import tworpus_user_id
from django.http import HttpResponse

from session.models import Session
import json


def home(request):
    id = tworpus_user_id.getUid()
    return render(request, "base.html", {
        "sid": str(id)
    })