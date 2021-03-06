# -*- coding: utf-8
from __future__ import unicode_literals, absolute_import

import django
import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEBUG = True
USE_TZ = True
ALLOWED_HOSTS = []

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "e^k9pimsn93u=ab@)-^obdxr3n^0p&&c0iv#zs6b!mz$43gjuf"

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.sites',
    'django.contrib.sitemaps',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    # 3rd party apps
    'crispy_forms',
    'mptt',
    'meta',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'corsheaders',
    # project apps
    'react_comments_django',
    'django_filters'
]

_MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
if django.VERSION >= (1, 10):
    MIDDLEWARE = _MIDDLEWARE_CLASSES
else:
    MIDDLEWARE_CLASSES = _MIDDLEWARE_CLASSES

CORS_ALLOWED_ORIGINS = [
    # allow api call from components-demo-project
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

ROOT_URLCONF = "tests.urls"

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            # os.path.join(BASE_DIR, 'backend', 'templates'),
            os.path.join(BASE_DIR, 'frontend', 'build')]  # TODO it should be configurable
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                # 'react_comments_django.context_processors.react_comments_django_settings',
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(BASE_DIR, 'db.sqlite3'),
        # "NAME": ":memory:",
    }
}

SITE_ID = 1
STATIC_URL = '/static/'
STATIC_ROOT = '/frontend/build'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'frontend', 'build')]

# django-crispy-forms config:
# CRISPY_TEMPLATE_PACK = 'bootstrap3'

# django config:
# REACT_COMMENTS_DJANGO_BASE_TEMPLATE = "react-comments-django/react_index.html"
REACT_COMMENTS_DJANGO_USE_INTERNAL_USER = True

# email
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'


ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = False
