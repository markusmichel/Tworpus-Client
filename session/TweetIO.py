import subprocess
import shlex
import glob
import threading
import os
import sys
import signal
from tworpus import settings, data_converter
import json
from session.models import Session

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
    def onSuccess(self, values):
        pass

    def onError(self, values):
        pass

    def onFinish(self):
        pass

    def onCancel(self):
        pass


class FetchersManager():
    """
    Wrapper around dict.
    Manages a list of running processes.
    """

    def __init__(self):
        self.fetchers = dict()

    def add(self, fetcher, _id):
        self.fetchers[str(_id)] = fetcher

    def get(self, _id):
        # if id in self.fetchers:
        #     self.fetchers[id]
        # else:
        #     None
        if str(_id) in self.fetchers:
            return self.fetchers[str(_id)]

    def remove(self, _id):
        if str(_id) in self.fetchers:
            fetcher = self.get(str(_id))
            fetcher.cancel()
            self.fetchers.pop(str(_id))


class TweetsFetcher():
    """
    Fetches and merges tweets as XML file(s).
    Process is done by jar file started through subprocess.
    """
    def __init__(self, tweetsCsvFile, outputDir, tweetsPerXml):
        self.__process = None
        self.tweetsCsvFile = tweetsCsvFile
        self.outputDir = outputDir
        self.__cacheDir = settings.XML_CACHE_DIR
        self.__canceled = False
        self.__tweetsPerXml = tweetsPerXml

        self.__updateListeners = []

    def addListener(self, listener):
        self.__updateListeners.append(listener)

    def fetch(self):
        thread = threading.Thread(target=self.__startJar)
        thread.start()

    def __startJar(self):
        argsStr  = "java -jar " + settings.TWORPUS_FETCHAR_JAR + \
                   " -input-file " + self.tweetsCsvFile + \
                   " -xml-cache-folder " + self.__cacheDir + \
                   " -xml-output-folder " + self.outputDir + \
                   " -split-after " + str(self.__tweetsPerXml)
        # argsStr += " -override"
        # argsStr += " -csv-no-title"

        #setting the correct path for windows
        argsStr = argsStr.replace("\\", "/")
        args = shlex.split(argsStr)  # creates args array for subprocess
        self.__process = subprocess.Popen(args, shell=False, stdout=subprocess.PIPE)

        while True:
            line = self.__process.stdout.readline()
            if not line:
                break

            values = self.parseDownloadProgressFromLine(line)
            if values is not None:
                if values["result"] == "success":
                    for listener in self.__updateListeners:
                        listener.onSuccess(values)
                elif values["result"] == "error":
                    for listener in self.__updateListeners:
                        listener.onError(values)

            sys.stdout.flush()

        self.__process.communicate()  # blocks subprocess until finish
        self.__onFinish() if self.__canceled is not True else self.__onCancel()

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
        self.__canceled = True
        if self.__process is not None:
            os.kill(self.__process.pid, signal.SIGTERM)
        else:
            self.__onCancel()

    # internal progress callbacks
    def __onFinish(self):
        self.__process = None
        for listener in self.__updateListeners:
            listener.onFinish()

    def __onCancel(self):
        for listener in self.__updateListeners:
            listener.onCancel()
    # end internal progress callbacks


class TweetProgressEventHandler(FetcherProgressListener):

    def __init__(self, corpusid):
        self.__corpusid = corpusid
        self.__session = Session.objects.all().filter(id=corpusid).first()

        self.__numTweetsFetched = 0
        self.__numTweetsFailed  = 0
        self.__tweetsFetchedOnStart = self.__session.tweetsFetched
        self.__tweetsFailedOnStart  = self.__session.tweetsFailed

        self.__lastProgressSent = 0

    def onSuccess(self, values):
        self.__numTweetsFetched += 1
        if self.__numTweetsFetched > self.__tweetsFetchedOnStart:
            self.__session.tweetsFetched = self.__numTweetsFetched

        self.__onProgress(values)

    def onError(self, values):
        self.__numTweetsFailed += 1
        if self.__numTweetsFailed > self.__tweetsFailedOnStart:
            self.__session.tweetsFailed = self.__numTweetsFailed

        self.__onProgress(values)

    def onCancel(self):
        self.__session.working = False
        self.__session.completed = False
        self.__session.save()

    def onFinish(self):
        from tworpus import tweet_converter

        baseFolder = os.path.join(settings.BASE_PROJECT_DIR, self.__session.folder)
        xmlFiles = glob.glob(os.path.join(baseFolder, "*.xml"))
        for xmlFile in xmlFiles:
            try:
                # Run data converters if selected
                converterIds = json.loads(self.__session.converters)
                if converterIds.__len__() > 0:

                    newXmlFile = xmlFile + ".tmp.xml"
                    os.rename(xmlFile, newXmlFile)

                    app = tweet_converter.ConverterApp(newXmlFile, xmlFile)
                    converters = data_converter.get_converters_from_ids(converterIds)
                    for converter in converters:
                        class_name = converter["class_name"]
                        module_name = converter["module_name"]
                        package = converter["package"]
                        fullname = "converters." + package

                        mod = __import__(fullname, globals(), locals(), [module_name], -1)
                        converter_module = getattr(mod, module_name)
                        converter_class = getattr(converter_module, class_name)
                        app.register_converter(converter_class())

                    app.run()
            except:
                pass

        xmlFiles = glob.glob(os.path.join(baseFolder, "*.tmp.xml"))
        for xmlFile in xmlFiles:
            os.remove(xmlFile)

        self.__session.working = False
        self.__session.completed = True
        self.__session.save()

    def __onProgress(self, values):
        progress = (float(values["failed"]) + float(values["succeeded"])) / float(values["total"]) * 100
        if progress > self.__session.progress:
            self.__session.progress = progress
            self.__session.save()

        self.__lastProgressSent += 1

        if self.__lastProgressSent is 10:
            self.__lastProgressSent = 0