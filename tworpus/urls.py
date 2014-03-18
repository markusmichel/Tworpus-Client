from django.conf.urls import patterns, include, url
from visualizer import views as visualizerViews
from session import views as sessionViews
import views as baseViews

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'tworpus.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^test/', visualizerViews.index),

    url(r'^views/createcorpus/', sessionViews.createCorpusContent),
    url(r'^$', baseViews.home),

    url(r'^api/createcorpus', sessionViews.startCreateCorpus),
    url(r'^api/activesessions', sessionViews.getActiveSessions),
    url(r'^api/sessions', sessionViews.getSessions),
    url(r'^api/session', sessionViews.getSession),
    url(r'^api/corpus/pause', sessionViews.pauseCorpus),
    url(r'^api/corpus/remove', sessionViews.removeCorpus)
)
