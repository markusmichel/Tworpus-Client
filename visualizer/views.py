from django.shortcuts import render
from django.http import HttpResponse
from django.template import RequestContext, loader

def index(request):
    template = loader.get_template('index.html')
    context = RequestContext(request, {
        'foo': 'bar',
    })
    return HttpResponse(template.render(context))