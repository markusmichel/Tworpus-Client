Tworpus-Client
==============
Ermöglicht das Abfragen großer Mengen an aktuellen und alten Tweets. 
Aus den Tweets können Korpora erstellt werden.

## Installation
- git clone https://github.com/markusmichel/Tworpus-Client.git
- $> npm install -g bower
- $> cd tworpus/static/
- $> bower install (für Windows: in git shell ausführen)
- cp tworpus/static/bootstrap.less tworpus/static/bower_components/bootstrap/less/bootstrap.less
- cd tworpus/static/bower_components/bootstrap
- npm install -g grunt-cli
- grunt

## Falls sqlite3-Datenbank nicht existiert
- &> python manage.py syncdb

## Technologien
- Python `2.7.x`
- Django
- https://github.com/markusmichel/Tworpus-Fetcher-Lib
