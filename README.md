Tworpus-Client
==============
Ermöglicht das Abfragen großer Mengen an aktuellen und alten Tweets. 
Aus den Tweets können Korpora erstellt werden.

## Benötigte PyCharm/Python Packages:
- setuptools
- pip
- Django
- nltk
- beautifulsoup4
- enum
- lxml (Download: http://www.lfd.uci.edu/~gohlke/pythonlibs/)


## Installation
- git clone https://github.com/markusmichel/Tworpus-Client.git
- `$> npm install -g bower`
- `$> cd tworpus/static/`
- `$> bower install` (für Windows: in git shell ausführen)


## CSS/JS aktualisieren
- `$> cd tworpus/static`
- `$> npm install`
- `$> grunt`

## CSS/JS auf änderungen überwachen
- `$> cd tworpus/static`
- `$> grunt watch`

## Falls sqlite3-Datenbank nicht existiert
- `&> python manage.py syncdb`

## Technologien
- Python `2.7.x`
- Django
- https://github.com/markusmichel/Tworpus-Fetcher-Lib
