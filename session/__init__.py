from session.models import Session
from tworpus import settings
import os

try:
    for session in Session.objects.all():
        # Set all session to NOT working on server start
        session.working = False
        session.save()

        # Check if all folders for saved sessions still exist
        projectFolder = os.path.join(settings.BASE_PROJECT_DIR, session.folder)
        if os.path.isdir(projectFolder) is not True:
            session.delete()

except:
    pass

#@TODO: Write method like checkSessions or checkSessionFolders which iterates all saved sessions and remove the ones
# which don't have a project folder anymore (deleted by user). Might be called on server start or every x minutes



# a = {x for x in 'abracadabra' if x not in 'abc'}