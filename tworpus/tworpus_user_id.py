import uuid

id = None


def getUid():
    global id
    if id is None:
        id = uuid.uuid4()
    return id