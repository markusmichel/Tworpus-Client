from django.conf.urls import patterns, include, url
from session import views as sessionViews
import views as baseViews
from session import views_cache as cacheViews

urlpatterns = patterns('',
    url(r'^$', baseViews.home),

    url(r'^api/createcorpus', sessionViews.startCreateCorpus),
    url(r'^api/exit', sessionViews.exit_application),
    url(r'^api/activesessions', sessionViews.getActiveSessions),
    url(r'^api/sessions', sessionViews.getSessions),
    url(r'^api/session', sessionViews.getSession),
    url(r'^api/corpus/pause', sessionViews.pauseCorpus),
    url(r'^api/corpus/remove', sessionViews.removeCorpus),
    url(r'^api/corpus/resume', sessionViews.resumeCorpus),
    url(r'^api/corpus/download', sessionViews.downloadCorpus),
    url(r'^api/corpus/recreate', sessionViews.recreateCorpus),

    url(r'^api/corpus/cache/status', cacheViews.cacheStatus),
    url(r'^api/corpus/cache/clear', cacheViews.clearCache),

    url(r'^api/settings/tweets_per_xml/get', baseViews.get_tweets_per_xml),
    url(r'^api/settings/tweets_per_xml/set', baseViews.set_tweets_per_xml),

    url(r'^api/converters/', baseViews.converters_list),
    url(r'^st/*', baseViews.static)
)
