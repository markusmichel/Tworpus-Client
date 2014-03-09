import nltk
import xml.dom.minidom as dom
import codecs

file = open("tweets.xml")
tree = dom.parse(file)
i = 0
e = 0

for tweet in tree.firstChild.childNodes:

    try:
        textNodes = tweet.getElementsByTagName("text")

        x = tree.createElement("foo")

        for textNode in textNodes:
            textValue = textNode.firstChild.nodeValue
            tokenized = nltk.word_tokenize(textValue)
            tokenizedNode = tree.createTextNode(' '.join(word for word in tokenized))

            pos = nltk.pos_tag(tokenized)
            print tokenizedNode.nodeValue
            x.appendChild(tokenizedNode)
            tweet.appendChild(x)

            #print textNode.firstChild.nodeValue
            i += 1
            print i

    except:
        e += 1

newFile = codecs.open("tweets_modified.xml", "w", encoding='utf-8')
tree.writexml(newFile)
file.close()


print "Program finished, found " + str(i) + " entries"
print str(e) + " tweets failed"