from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
import subprocess
import shlex
import threading
import os
import sys
import signal
from tworpus import settings


__manager = None


def getManager():
    """
    Singleton wrapper for FetchersManager
    """
    global __manager
    if __manager is None:
        __manager = FetchersManager()
    return __manager


class FetcherProgressListener:
    """

    """
    def onSuccess(self, values):
        pass

    def onError(self, values):
        pass

    def onFinish(self):
        pass


class FetchersManager():
    """
    Wrapper around dict.
    Manages a list of running processes.
    """

    def __init__(self):
        self.fetchers = dict()
        self.fetchers["test"] = "foo"

    def add(self, fetcher, id):
        self.fetchers[str(id)] = fetcher
        print self.fetchers

    def get(self, id):
        # if id in self.fetchers:
        #     self.fetchers[id]
        # else:
        #     None
        return self.fetchers[str(id)]

    def remove(self, id):
        fetcher = self.get(str(id))
        fetcher.cancel()
        self.fetchers.pop(str(id))


class TweetsFetcher():
    """
    Fetches and merges tweets as XML file(s).
    Process is done by jar file started through subprocess.
    """
    def __init__(self, tweetsCsvFile, outputDir, updateListener=None):
        """
        @type updateListener: FetcherProgressListener
        """
        # assert isinstance(updateListener, FetcherProgressListener)

        self.__process = None
        self.tweetsCsvFile = tweetsCsvFile
        self.outputDir = outputDir
        self.__updateListener = updateListener
        self.__cacheDir = settings.XML_CACHE_DIR

    def fetch(self):
        thread = threading.Thread(target=self.__startJar)
        thread.start()

    def __startJar(self):
        argsStr  = "java -jar " + settings.TWORPUS_FETCHAR_JAR + \
                   " -input-file " + self.tweetsCsvFile + \
                   " -xml-cache-folder " + self.__cacheDir + \
                   " -xml-output-folder " + self.outputDir
        # argsStr += " -override"
        # argsStr += " -csv-no-title"

        args = shlex.split(argsStr)  # creates args array for subprocess
        self.__process = subprocess.Popen(args, shell=False, stdout=subprocess.PIPE)

        while True:
            line = self.__process.stdout.readline()
            if not line:
                break

            values = self.parseDownloadProgressFromLine(line)
            if values is not None:
                if values["result"] == "success":
                    self.__updateListener.onSuccess(values)
                elif values["result"] == "error":
                    self.__updateListener.onError(values)

            sys.stdout.flush()

        self.__process.communicate()  # blocks subprocess until finish
        self.__onFinish()
        print "FINISHED JAR PROGRAM"

    def parseDownloadProgressFromLine(self, line):
        """
        Receives a string/line from the command line output of tworpus_fetcher.jar
        and parses relevant information like failed tweets, successful tweets and source location.
        """
        line = str(line)
        if not line.startswith("Fetch:"):
            return None

        line = line.strip("Fetch:").strip("\n")
        values = line.split(",")

        result = dict()
        for val in values:
            tupel = val.split("=")
            result[str(tupel[0])] = tupel[1]

        return result

    def cancel(self):
        """
        Terminates running tasks if there are any
        """
        if self.__process is not None:
            os.kill(self.__process.pid, signal.SIGTERM)

    # internal progress callbacks
    def __onFinish(self):
        self.__process = None
        if self.__updateListener is not None: self.__updateListener.onFinish()
    # end internal progress callbacks


from session.models import Session
class TweetProgressEventHandler(FetcherProgressListener):

    def __init__(self, corpusid):
        self.__corpusid = corpusid
        self.__session = Session.objects.all().filter(id=corpusid).first()
        self.__lastProgressSent = 0

    def onSuccess(self, values):
        self.__onProgress(values)
        print "success"

    def onError(self, values):
        self.__onProgress(values)
        print "error"

    def onFinish(self):
        self.__session.working = False
        self.__session.completed = True
        self.__session.save()

    def __onProgress(self, values):
        self.__session.progress = (float(values["failed"]) + float(values["succeeded"])) / float(values["total"]) * 100
        self.__session.save()

        from tworpus import tworpus_user_id
        from StringIO import StringIO
        import urllib, httplib, json

        self.__lastProgressSent += 1

        if self.__lastProgressSent is 10:
            self.__lastProgressSent = 0

            # sessions = [session.as_json() for session in Session.objects.all()]

            id = tworpus_user_id.getUid()
            # url = "http://localhost:3000/api/v1/sockets/emit/" + str(id)
            urlQuery = "/api/v1/sockets/emit/progress/" + str(id)

            io = StringIO()
            statusJsonString = json.dumps(self.__session.as_json(), io)
            data = {}
            data["status"] = statusJsonString
            statusJsonString = urllib.urlencode(data)

            httpConn = httplib.HTTPConnection('localhost:3000')
            headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
            httpConn.request('POST', urlQuery, statusJsonString, headers)