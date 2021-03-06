Tworpus-Client
==============
Ermöglicht das Abfragen großer Mengen an aktuellen und alten Tweets. 
Aus den Tweets können Korpora erstellt werden.

## Installation
- git clone https://github.com/markusmichel/Tworpus-Client.git
- `$> npm install -g bower`
- `$> cd tworpus/static/`
- `$> bower install` (für Windows: in git shell ausführen)

## Installing NLTK Data:
- Python Shell
- `>>> import nltk`
- `>>> nltk.download()`
- download all

## Create CSS/JS files
- `$> cd tworpus/static`
- `$> npm install`
- `$> grunt`

## Watch CSS/JS for changes
- `$> cd tworpus/static`
- `$> grunt watch`

## Recreate sqlite3-database
- `&> python manage.py syncdb`

## Technologies
- Python `2.7.x` `32 Bit`
- Django
- https://github.com/markusmichel/Tworpus-Fetcher-Lib

## Needed python packages
- nltk
- beautifulsoup4
- enum
- lxml (Download: http://www.lfd.uci.edu/~gohlke/pythonlibs/)
- For Windows: NumPy (Download: http://sourceforge.net/projects/numpy/files/NumPy/)
