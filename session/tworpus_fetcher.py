import urllib2
from tworpus import settings


def getCsvListStr(limit=10, language="en", min_wordcount=0, min_charcount=0, start_date=None, end_date=None):
    baseTworpusUrl = settings.TWORPUS_BASE_URL
    url = baseTworpusUrl + "/api/v1/tweets/find?format=csv&limit=" + str(limit) + "&languages=" + language
    url = url + "&wordcount=" + str(min_wordcount) + "&charcount=" + str(min_charcount)

    if start_date is not None and end_date is not None:
        url = url + "&startdate=" + start_date + "&enddate=" + end_date

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