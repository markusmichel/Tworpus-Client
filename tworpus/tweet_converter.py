from lxml import etree
import nltk


class BaseTweetTextConverter():
    def convert(self, text):
        pass


class PosTagConverterBase(BaseTweetTextConverter):
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
    def __init__(self, sourceFile, destFile):
        self.__tweetsFile = sourceFile
        self.converters = []

    def register_converter(self, converter):
        self.converters.append(converter)