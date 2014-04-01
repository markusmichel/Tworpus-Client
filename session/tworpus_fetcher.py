import urllib2
from tworpus import settings

def getCsvListStr(limit=10, language="en", minWordcount=0, minCharcount=0, startDate=None, endDate=None):
    baseTworpusUrl = settings.TWORPUS_BASE_URL
    url = baseTworpusUrl + "/api/v1/tweets/find?format=csv&limit=" + str(limit) + "&languages=" + language
    url = url + "&wordcount=" + str(minWordcount) + "&charcount=" + str(minCharcount)

    if startDate is not None and endDate is not None:
        url = url + "&startdate=" + startDate + "&enddate=" + endDate

    fetchedData = {}
    try:
        response = urllib2.urlopen(url)
        status = response.getcode()
        csvStr = response.read()

        fetchedData['status'] = status
        fetchedData['content'] = csvStr

    except urllib2.HTTPError as e:
        fetchedData['status'] = e.getcode()


    return fetchedData