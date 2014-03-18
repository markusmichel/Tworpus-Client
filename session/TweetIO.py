from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
import subprocess
import shlex
import threading
import os
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


class TweetsFetcher(FileSystemEventHandler):
    """
    Fetches and merges tweets as XML file(s).
    Process is done by jar file started through subprocess.
    """

    def __init__(self, tweetsCsvFile, outputDir, updateListener=None):
        self.__process = None
        self.tweetsCsvFile = tweetsCsvFile
        self.outputDir = outputDir
        self.__updateListener = updateListener
        self.__cacheDir = settings.XML_CACHE_DIR

    def fetch(self):
        event_handler = XmlFetcherEventHandler()
        observer = Observer()
        observer.schedule(event_handler, self.outputDir, recursive=True)
        observer.start()

        thread = threading.Thread(target=self.__startJar)
        thread.start()

    def __startJar(self):
        # args = ['java', '-jar', settings.TWORPUS_FETCHAR_JAR, self.tweetsCsvFile, self.outputDir]
        # subprocess.call(['java', '-jar', settings.TWORPUS_FETCHAR_JAR, self.tweetsCsvFile, self.outputDir])

        argsStr  = "java -jar " + settings.TWORPUS_FETCHAR_JAR + \
                   " -input-file " + self.tweetsCsvFile + \
                   " -xml-cache-folder " + self.__cacheDir + \
                   " -xml-output-folder " + self.outputDir
        # argsStr += " -override"

        args = shlex.split(argsStr)  # creates args array for subprocess
        self.__process = subprocess.Popen(args, shell=False)
        self.__process.communicate()  # blocks subprocess until finish

        # @TODO: emit finish
        print "FINISHED JAR PROGRAM"

    def cancel(self):
        """
        Terminates running tasks if there are any
        """
        if self.__process is not None:
            os.kill(self.__process.pid, signal.SIGTERM)

    # internal progress callbacks
    def __onFinish(self):
        self.__process = None
    # end internal progress callbacks

    # Watchdog callbacks
    def on_created(self, event):
        """
        Overrides FileSystemEventHandler
        """
        super(XmlFetcherEventHandler, self).on_created(event)

        if not event.is_directory:
            if event.src_path.endswith(".xml"):
                print "___XML FILE FOUND____"

    def on_modified(self, event):
        """
        Overrides FileSystemEventHandler
        """
        super(XmlFetcherEventHandler, self).on_modified(event)

        if not event.is_directory:
            if event.src_path.endswith(".xml"):
                print "___XML FILE FOUND____"
    #Watchdog callbacks end


class XmlFetcherEventHandler(FileSystemEventHandler):
    """
    Directory change listener using watchdog.
    """

    noXmlFiles = 0

    def on_created(self, event):
        super(XmlFetcherEventHandler, self).on_created(event)

        if not event.is_directory:
            if event.src_path.endswith(".xml"):
                print "___XML FILE FOUND____"


    def on_modified(self, event):
        super(XmlFetcherEventHandler, self).on_modified(event)

        if not event.is_directory:
            if event.src_path.endswith(".xml"):
                print "___XML FILE FOUND____"