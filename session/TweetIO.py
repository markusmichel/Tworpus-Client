import os
import tworpus.settings as settings
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
import subprocess
import threading
from tworpus import settings

class TweetsFetcher(FileSystemEventHandler):

    def __init__(self, tweetsCsvFile, outputDir, updateListener=None):
        self.tweetsCsvFile = tweetsCsvFile
        self.outputDir = outputDir
        self.__updateListener = updateListener

    def fetch(self):
        event_handler = XmlFetcherEventHandler()
        observer = Observer()
        observer.schedule(event_handler, self.outputDir, recursive=True)
        observer.start()

        thread = threading.Thread(target=self.__startJar)
        thread.start()

    def __startJar(self):
        subprocess.call(['java', '-jar', settings.TWORPUS_FETCHAR_JAR, self.tweetsCsvFile, self.outputDir])
        print "FINISHED JAR PROGRAM"

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