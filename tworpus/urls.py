from django.conf.urls import patterns, include, url
from visualizer import views as visualizerViews
from session import views as sessionViews

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'tworpus.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^test/', visualizerViews.index),

    url(r'^new/', sessionViews.createCorpus),
    url(r'^api/createcorpus', sessionViews.startCreateCorpus),
    url(r'^api/progress', sessionViews.checkCorpusCreationProgress)
)
