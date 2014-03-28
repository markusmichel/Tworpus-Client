from lxml import etree
from copy import deepcopy
import codecs
import nltk

# time start
import time
start_time = time.time()

sent_detector = nltk.data.load('tokenizers/punkt/english.pickle')

file = codecs.open("tweets_big.xml", encoding="UTF-8")
xmlSource = 'tweets_big.xml'

context = etree.iterparse(xmlSource, events=('end',), tag='tweet', encoding="UTF-8")

# iterates through the whole xml without eating up the whole memory
# http://www.ibm.com/developerworks/library/x-hiperfparse/
# required for pos_tag --> numpy (http://sourceforge.net/projects/numpy/files/NumPy/)
root = etree.Element("tweets")
e = 0
i = 0
for action, tweet in context:
    #print("%s: %s" % (action, tweet.findtext("text")))

    tweetText = tweet.findtext("text")

    try:

        posTagsNode = etree.Element("posTags")
        textSentence = sent_detector.tokenize(tweetText)
        textId = 0

        for sentence in textSentence:

            sentenceNode = etree.Element("sentence", id=str(textId))
            tokenized = nltk.word_tokenize(sentence)
            pos = nltk.pos_tag(tokenized)

            posId = 0
            for posTuple in pos:
                posNode = etree.Element("word", pos=posTuple[1], id=str(posId))
                posNode.text = posTuple[0]
                sentenceNode.append(posNode)
                posId += 1

            posTagsNode.append(sentenceNode)
            textId += 1

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

file.close()
newFile = open("tweets_modified_lxml.xml","w")
newFile.write(etree.tostring(root, pretty_print=True, xml_declaration=True,encoding="UTF-8"))
newFile.close()

# tree.write('tweets_modified_lxml.xml', pretty_print=True, xml_declaration=True)
#file.close()

print "Program finished, found " + str(i) + " entries"
print str(e) + " tweets failed"
print time.time() - start_time, "seconds"