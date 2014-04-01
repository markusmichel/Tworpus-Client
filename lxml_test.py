from copy import deepcopy
from lxml import etree


# time start
import time
from tworpus import tweet_converter

start_time = time.time()

# file = codecs.open("tweets_modified.xml", encoding="UTF-8")
# xmlSource = 'tweets_modified.xml'
xmlSource = open('tweets_modified.xml')


context = etree.iterparse(xmlSource, events=('end',), tag='tweet', encoding="UTF-8")

# iterates through the whole xml without eating up the whole memory
# http://www.ibm.com/developerworks/library/x-hiperfparse/
root = etree.Element("tweets")
e = 0
i = 0
for action, tweet in context:
    # print("%s: %s" % (action, tweet.findtext("text")))

    tweetText = tweet.findtext("text")

    try:

        converter = tweet_converter.PosTagConverterBase()
        posTagsNode = converter.convert(tweetText)

        tweet.append(posTagsNode)
        root.append(deepcopy(tweet))

        i += 1
    except:
        e += 1


    tweet.clear()

    # Also eliminate now-empty references from the root node to <Title>
    while tweet.getprevious() is not None:
        del tweet.getparent()[0]


#newFile = codecs.open("tweets_modified_lxml.xml", "w", encoding='utf-8')

# file.close()
newFile = open("tweets_modified_lxml.xml","w")
newFile.write(etree.tostring(root, pretty_print=True, xml_declaration=True,encoding="UTF-8"))
newFile.close()

# tree.write('tweets_modified_lxml.xml', pretty_print=True, xml_declaration=True)
#file.close()

print "Program finished, found " + str(i) + " entries"
print str(e) + " tweets failed"
print time.time() - start_time, "seconds"