"""
Django settings for tworpus project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
from importlib import import_module
import os

# Application definition
INSTALLED_APPS = (
    'django.contrib.staticfiles',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'tworpus',
    'session',
    'visualizer',
)


BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'ws75a99z76$a2xiv0b*zxm8gb6a925xl&3!lw5-33vb=mnemwg'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []


MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'tworpus.urls'

WSGI_APPLICATION = 'tworpus.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'


# Custom variables
BASE_PROJECT_DIR = os.path.join(BASE_DIR, 'projects')
XML_CACHE_DIR = os.path.join(BASE_DIR, 'xmlcache')
TWORPUS_BASE_URL = "http://localhost:3000"
TWORPUS_FETCHAR_JAR = os.path.join(BASE_DIR, "tworpus_fetcher.jar")
CONVERTERS_DIR = os.path.join(BASE_DIR, "converters")