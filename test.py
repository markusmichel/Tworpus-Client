import nltk
import xml.dom.minidom as dom
import codecs



import nltk.data
sent_detector = nltk.data.load('tokenizers/punkt/english.pickle')



file = open("tweets.xml")
tree = dom.parse(file)
i = 0
e = 0

for tweet in tree.firstChild.childNodes:

    try:
        textNodes = tweet.getElementsByTagName("text")
        posTagsNode = tree.createElement("posTags")

        for textNode in textNodes:
            text = textNode.firstChild.nodeValue

            #print('\n-----\n'.join(sent_detector.tokenize(text.strip())))

            textSentence = sent_detector.tokenize(text.strip())

            textId = 0

            for sentence in textSentence:

                sentenceNode = tree.createElement("sentence")
                sentenceNode.setAttribute("id", str(textId))

                tokenized = nltk.word_tokenize(sentence)

                pos = nltk.pos_tag(tokenized)

                posId = 0
                for posTuple in pos:
                    posNode = tree.createElement("word")
                    posNode.setAttribute("pos", posTuple[1])
                    posNode.setAttribute("id", str(posId))
                    posValueNode = tree.createTextNode(posTuple[0])
                    posNode.appendChild(posValueNode)
                    sentenceNode.appendChild(posNode)
                    posId += 1

                posTagsNode.appendChild(sentenceNode)
                textId += 1

            tweet.appendChild(posTagsNode)

            i += 1
            print i

    except:
        e += 1

newFile = codecs.open("tweets_modified.xml", "w", encoding='utf-8')
tree.writexml(newFile)
file.close()


print "Program finished, found " + str(i) + " entries"
print str(e) + " tweets failed"