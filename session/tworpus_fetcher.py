import urllib2
from tworpus import settings

def getCsvListStr(limit=10, language="en", minWordcount=0, minCharcount=0):
    baseTworpusUrl = settings.TWORPUS_BASE_URL
    url = baseTworpusUrl + "/api/v1/tweets/find?limit=" + str(limit) + "&languages=" + language
    url = url + "&wordcount=" + str(minWordcount) + "&charcount=" + str(minCharcount)

    # @TODO: add startdate and enddate
    #url = url + "&startdate=1391967436&enddate=0"

    response = urllib2.urlopen(url)
    csvStr = response.read()

    return csvStr

def getCsvList(limit=10, language="en", minWordcount=0, minCharcount=0):
    csvStr = getCsvListStr(limit, language, minWordcount, minCharcount)
    csvRows = csvStr.split('\n')

    # remove csv titles
    if len(csvRows) > 0:
        del csvRows[0]