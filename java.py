import threading
import subprocess
import urllib2
import os

import tworpus.settings as settings


# for watchdog
import sys
import time
import logging
from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler
from watchdog.events import FileSystemEventHandler


response = urllib2.urlopen("http://localhost:3000/api/v1/tweets/find?limit=300&languages=de,en&wordcount=20&startdate=1391967436&enddate=0")
content = response.read()

# split response in rows. each row represents one tweet (tweet_id, userid, language)
rows = content.split('\n')

# remove csv titles
del rows[0]


#for row in rows:
#    print row


class TweetsFetcher(threading.Thread):

    def __init__(self, callback, csvFileName, outputFolderName=""):
        self.__callback = callback
        self.__filename = csvFileName
        self.__outputFolder = outputFolderName

    def run(self):
        self.fetchTweets()
        self.__callback()

    def fetchTweets(self):
        subprocess.call(['java', '-jar', 'tworpus_fetcher.jar', self.__filename, self.__outputFolder])

class XmlFetcherEventHandler(FileSystemEventHandler):

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


def cb():
    print "FINISHED JAVA THREAD"


outFolder = settings.BASE_PROJECT_DIR + os.sep + "test123"
outXmlFolder = outFolder + os.sep + "xml"

if not os.path.isdir(outXmlFolder):
    os.makedirs(outXmlFolder)


event_handler = XmlFetcherEventHandler()
observer = Observer()
observer.schedule(event_handler, outFolder, recursive=True)
observer.start()

def startJar(cb, filename="tweets.csv", outputFolder="."):
    subprocess.call(['java', '-jar', 'tworpus_fetcher.jar', filename, outputFolder])
    cb()

thread = threading.Thread(target=startJar, args=(cb, "tweets.csv", outFolder))
thread.start()


#fetcher = TweetsFetcher(cb, csvFileName="tweets.csv", outputFolderName="test123")
#fetcher.run()

print "Immediately called after starting fetcher thread"
