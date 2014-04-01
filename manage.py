#!/usr/bin/env python
import os
import sys
from django.core.management import execute_from_command_line
import subprocess
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tworpus.settings")

if __name__ == "__main__":
    execute_from_command_line(sys.argv)

    # try:
    #     sys.argv.insert(0, 'python')
    #     __process = subprocess.Popen(sys.argv, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
    #     __process.communicate()
    #
    # except Exception as e:
    #     print e
    #     pass
    # print "end"