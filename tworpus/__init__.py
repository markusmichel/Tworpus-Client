#from models import TworpusSettings

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

#check_settings_available()