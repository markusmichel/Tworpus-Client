from lxml import etree
from copy import deepcopy
import nltk


class BaseTweetTextConverter():
    def convert(self, text):
        pass


class PosTagConverter(BaseTweetTextConverter):
    def convert(self, text):
        sent_detector = nltk.data.load('tokenizers/punkt/english.pickle')

        posTagsNode = etree.Element("posTags")
        textSentence = sent_detector.tokenize(text)
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

        return posTagsNode


class ConverterApp():
    def __init__(self, source_file, dest_file):
        self.tweets_file = source_file
        self.dest_file = dest_file
        self.converters = []

        self.root_node_name = "tweets"
        self.tweet_node_name = "tweet"
        self.text_node_name = "text"
        self.converter_node_name = "converter"

    def register_converter(self, converter):
        self.converters.append(converter)

    def _run_converters(self, text):
        print text
        converter_node = etree.Element(self.converter_node_name)
        for converter in self.converters:
            converter_node.append(converter.convert(text))

        return converter_node

    def run(self):
        """
        iterates through the whole xml without eating up the whole memory
        http://www.ibm.com/developerworks/library/x-hiperfparse/
        """
        context = etree.iterparse(self.tweets_file, events=('end',), tag=self.tweet_node_name, encoding="UTF-8")
        root = etree.Element(self.root_node_name)

        for action, tweet in context:
            tweetText = tweet.findtext(self.text_node_name)
            try:
                converter_node = self._run_converters(tweetText)
                tweet.append(converter_node)
                root.append(deepcopy(tweet))
            except:
                pass

            tweet.clear()

            # Also eliminate now-empty references from the root node to <Title>
            while tweet.getprevious() is not None:
                del tweet.getparent()[0]

        newFile = open(self.dest_file, "w")
        newFile.write(etree.tostring(root, pretty_print=True, xml_declaration=True,encoding="UTF-8"))
        newFile.close()