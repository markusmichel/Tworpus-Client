import shlex
import subprocess

argsStr = "python manage.py runserver"
args = shlex.split(argsStr)  # creates args array for subprocess
subprocess.Popen(args, shell=False, stdout=subprocess.PIPE)