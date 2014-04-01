from tworpus import tweet_converter

app = tweet_converter.ConverterApp("tweets.xml", "tweets_modified_lxml.xml")
app.register_converter(tweet_converter.PosTagConverter())
app.run()

print "finished"