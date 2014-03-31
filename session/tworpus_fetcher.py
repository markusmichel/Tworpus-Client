import urllib2
from tworpus import settings

def getCsvListStr(limit=10, language="en", minWordcount=0, minCharcount=0, startDate=None, endDate=None):
    baseTworpusUrl = settings.TWORPUS_BASE_URL
    url = baseTworpusUrl + "/api/v1/tweets/find?format=csv&limit=" + str(limit) + "&languages=" + language
    url = url + "&wordcount=" + str(minWordcount) + "&charcount=" + str(minCharcount)

    if startDate is not None and endDate is not None:
        url = url + "&startdate=" + startDate + "&enddate=" + endDate

    response = urllib2.urlopen(url)
    csvStr = response.read()

    return csvStr