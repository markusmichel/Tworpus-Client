from django.shortcuts import render_to_response, RequestContext
import tworpus_user_id

def home(request):
    request.META["CSRF_COOKIE_USED"] = True
    id = tworpus_user_id.getUid()
    return render_to_response("base.html", {"sid": str(id)}, context_instance=RequestContext(request))