import ConfigParser
import os
import glob
from tworpus import settings


def get_converter_dirs():
    pathname = settings.CONVERTERS_DIR
    dirs = []
    for dir in os.walk(pathname):
        if os.path.isdir(dir[0]) and dir[0] is not pathname:
            cfgfile = glob.glob(os.path.join(dir[0], "config.cfg"))
            if cfgfile.__len__() > 0:
                dirs.append(dir[0])

    return dirs


def get_converter_data():
    converters = []
    dirs = get_converter_dirs()
    for dir in dirs:
        config = ConfigParser.ConfigParser()
        config.read(os.path.join(dir, "config.cfg"))
        try:
            data = {}
            data["class_name"] = config.get("Data Converter", "class")
            data["module_name"] = config.get("Data Converter", "module")
            data["author_name"] = config.get("Data Converter", "author")
            data["company_name"] = config.get("Data Converter", "company")
            data["description"] = config.get("Data Converter", "description")
            data["title"] = config.get("Data Converter", "title")
            data["id"] = config.get("Data Converter", "id")
            data["package"] = os.path.basename(dir)

            converters.append(data)
        except:
            pass

    return converters


def get_converters_from_ids(ids):
    filteredconverters = []
    converters = get_converter_data()
    for id in ids:
        for converter in converters:
            if id == converter["id"]:
                filteredconverters.append(converter)

    return filteredconverters