from django.http import HttpResponse
import json
import os
import shutil

from tworpus import settings

def cacheStatus(request):
    size = 0
    numFiles = 0
    for (dirpath, dirnames, filenames) in os.walk(settings.XML_CACHE_DIR):
        numFiles = len(filenames)
        for f in filenames:
            fp = os.path.join(dirpath, f)
            size += os.path.getsize(fp)

    return HttpResponse(json.dumps({
        "numFiles": numFiles,
        "size": size
    }))

def clearCache(request):
    if request.method == "POST":
        try:
            shutil.rmtree(settings.XML_CACHE_DIR)
            return HttpResponse(json.dumps("success"))
        except:
            return HttpResponse(json.dumps("error"))
    else:
        return HttpResponse(status=500)