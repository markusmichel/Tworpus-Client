#!/usr/bin/env python
import os
import sys
import Cookie
import django.contrib.staticfiles
import django.contrib.sessions.serializers
import django.conf.urls.static
import django.template
import django.templatetags
import django.templatetags.future
import django.templatetags.static
import nltk
import threading


def start_browser(port):
    import webbrowser
    print "START BROWSER"
    new = 2 # open in a new tab, if possible
    url = "http://127.0.0.1:" + str(port)
    webbrowser.open(url, new=new)


if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tworpus.settings")

    from django.core.management import execute_from_command_line
    import django.test
    import HTMLParser

    from tworpus.models import TworpusSettings

    def check_settings_available():
        """
        assert that settings model exists
        """
        try:
            settings = TworpusSettings.objects.first()
            if settings is None:
                settings = TworpusSettings()
                settings.save()
        except:
            pass

    check_settings_available()

    timer = threading.Timer(2, start_browser, args=[sys.argv[2]])
    timer.start()

    # open_browser_thread = threading.Thread(target=start_browser, args=sys.argv[2])
    # open_browser_thread.start()

    execute_from_command_line(sys.argv)