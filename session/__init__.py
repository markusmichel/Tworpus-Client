from session.models import Session

for session in Session.objects.all():
    session.working = False
    session.save()


#@TODO: Write method like checkSessions or checkSessionFolders which iterates all saved sessions and remove the ones
# which don't have a project folder anymore (deleted by user). Might be called on server start or every x minutes



# a = {x for x in 'abracadabra' if x not in 'abc'}


test = dict()
test[0] = "0"
# test["0"] = "str 0"
test[str(0)] = "str 0"

print test