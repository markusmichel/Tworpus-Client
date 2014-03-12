# -*- coding: latin-1 -*-
"""
Interaction with Twitter and Tworpus.
"""

import json
import urllib2
from bs4 import BeautifulSoup
from threading import Thread
import Queue
import nltk
from nltk.tokenize.punkt import PunktWordTokenizer

# https://code.google.com/p/pythonthreadpool/wiki/ThreadPool
from nltk.tokenize.punkt import PunktWordTokenizer


class TwitterFetcherProgressListener:
    """
    Interface.
    Receives progress updates for corpus creation.
    """

    numSuccessfullTweets = 0
    numFailedTweets = 0
    numTotalTweets = 0

    successfullTweets = []
    failedTweets = []

    def resetCounter(self):
        self.reset()

    def reset(self):
        self.numSuccessfullTweets = 0
        self.numFailedTweets = 0
        self.successfullTweets = []
        self.failedTweets = []
        self.numTotalTweets = 0

    def onStart(self):
        pass
    def onProgress(data):
        pass
    def onFinish(self):
        pass


class TweetsFetcher:
    """
    Handles a list of TweetFetchers.
    Fires an event when all tweets are fetched.
    """

    # lister is type of TwitterFetcherProgressListener
    def __init__(self, listener):
        self.__isWorking = False
        self.__listener = listener
        self.__threadPoolMaxThreads = 30
        self.__numTweetsToFetch = 0
        self.__initLists()

    def __initLists(self):
        self.__fetchQueue = Queue.Queue()
        self.__workingThreads = []
        self.__listener.reset()

    def isWorking(self):
        #size = self.__fetchQueue.qsize()
        #len = len(self.__workingThreads)
        #return self.__fetchQueue.qsize() > 0 or len(self.__workingThreads) > 0
        return self.__isWorking

    def fetchTweets(self, ids):
        """
        Start fetching a list of tweets.
        """
        if self.isWorking() is True:
            raise Exception("Fetcher is still working")

        self.__isWorking = True
        self.__numTweetsToFetch = len(ids)
        self.__initLists()

        self.__listener.reset()
        self.__listener.numTotalTweets = len(ids)
        self.__listener.onStart()

        for id in ids:
            self.__startWorkerThread(id)

    def __startWorkerThread(self, id):
        """
        Start a new fetcher thread or append id in thread pool.
        """
        if(len(self.__workingThreads) <= self.__threadPoolMaxThreads):
            tweetId = str(id["tweet_id"])
            userId = str(id["userid"])

            fetcher = TweetFetcher(tweetId=tweetId, userId=userId, tweetsFetcher=self)
            self.__workingThreads.append(fetcher)
            fetcher.start()
        else:
            print "Len >= 50: queue worker"
            self.__fetchQueue.put(id)

    def onTweetFetchSuccess(self, tweet):
        """
        Called when a tweet was successfully fetched
        """
        self.__listener.numSuccessfullTweets += 1
        self.__listener.successfullTweets.append(tweet)
        self.__listener.onProgress()

    def onTweetFetchError(self, tweetId=0, userId=0):
        """
        Called when a tweet wasn't able to be fetched
        """
        self.__listener.numFailedTweets += 1

        tweet = {}
        tweet["userid"] = userId
        tweet["id"] = tweetId
        self.__listener.failedTweets.append(tweet)
        self.__listener.onProgress()

    def onFetched(self, thread):
        """
        Called when a tweet was fetched no matter if it was successfull or not
        """
        self.__workingThreads.remove(thread)

        if(self.__fetchQueue.qsize() > 0):
            self.__startWorkerThread(self.__fetchQueue.get())

        # All tweets have been fetched
        if self.__listener.numFailedTweets + self.__listener.numSuccessfullTweets >= self.__numTweetsToFetch:
            self.__isWorking = False
            self.__listener.onFinish()

    @staticmethod
    def getTweetIdList(limit=100, language="de", wordcount="0", charcount="0"):
        """
        Returns a list with metadata of tweets to fetch from twitter.
        The list is based on information like number of tweets, language, timespan,
        minimum wordcount and charcount.
        """
        baseUrl = "http://localhost:3000"
        url = baseUrl + "/api/v1/tweets/find?limit=" + str(limit) + "&languages=" + language + "&wordcount=" + str(wordcount)

        try:
            response = urllib2.urlopen(url).read()
        except urllib2.HTTPError:
            return []

        jsonResponse = json.loads(response)

        return jsonResponse

    def getProgress(self):
        """
        Progress in percent between 0 and 100
        """

        if self.__listener.numSuccessfullTweets + self.__listener.numFailedTweets >= self.__numTweetsToFetch:
            return 100
        else:
            return (float(self.__listener.numSuccessfullTweets + self.__listener.numFailedTweets) / self.__numTweetsToFetch) * 100



class TweetFetcher(Thread):
    """
    A fetcher is a single worker thread.
    It gets a tweet from twitter asynchronous and notifies the TweetsFetcher.
    """

    def __init__(self, tweetId, userId, tweetsFetcher):
        super(TweetFetcher, self).__init__()
        self.__tweetId = tweetId
        self.__userId = userId
        self.__tweetsFetcher = tweetsFetcher

    def run(self):
        self.__fetchTweet()

    def __fetchTweet(self):
        """
        Start async fetch of tweet.
        Calls success / fail callbacks on TweetsFetcher instance.
        """
        try:
            tweet = TweetFetcher.fetchTweet(self.__tweetId, self.__userId)
            self.__tweetsFetcher.onTweetFetchSuccess(tweet)

        except Exception as ex:
            self.__tweetsFetcher.onTweetFetchError(self.__tweetId, self.__userId)
            print "___EXCEPTION____"
            print ex

        self.__tweetsFetcher.onFetched(self)

    @staticmethod
    def fetchTweet(tweetId, userId):
        """ Return Tweet
        Fetch a tweet synchronous. Returns an instance of a Tweet object.
        Throws exception if twitter is unavailable or the parser failed to parse the text.
        """

        assert id != ""
        assert userId != ""

        url = 'https://twitter.com/' + str(userId) + '/status/' + str(tweetId)
        print url

        response = urllib2.urlopen(url)

        html = response.read()
        response.close()

        # html parser / searcher
        soup = BeautifulSoup(html)

        ## Extract tweet text
        text = soup.find("p", { "class" : "js-tweet-text" })
        text = ''.join(text.findAll(text=True))


        ## Find information about user
        userinfo    = soup.find("div", { "class" : "permalink-tweet" })
        screenName  = userinfo["data-screen-name"]
        fullName    = userinfo["data-name"]
        userId      = userinfo["data-user-id"] # @TODO: redundant?

        # create tweet instance
        tweet = Tweet(fullName, screenName, userId, text)
        return tweet


class Tweet:
    """
    Representation of a tweet fetched from twitter.
    Adds additional info like charcount and wordcount.
    """

    fullName = ""
    screenName = ""
    userId = 0
    tweetId = 0
    text = ""
    words = 0
    chars = 0

    def __init__(self, fullName, screenName, userId, text):
        #corpusReader = nltk.corpus.PlaintextCorpusReader(folder, '.*\.txt')

        self.fullName = fullName
        self.screenName = screenName
        self.userId = userId
        self.text = text

        tokens = PunktWordTokenizer().tokenize(self.text)
        self.words = tokens.__len__()
        self.chars = len([char for word in tokens for char in word])
        #print "text: " + text
        #print "text: " + str(self.chars)
        #print "Length = " + (str(tokens.__len__()))


def enum(**enums):
    return type('Enum', (), enums)

FetcherStatus = enum(notWorking=1, working=2)