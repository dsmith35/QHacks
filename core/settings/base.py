"""
Django settings for es project.

Generated by 'django-admin startproject' using Django 3.0.7.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os
from cloudinary import config


PRODUCTION_MODE = os.getenv("MODE") == "production"

ALLOWED_HOSTS = ["*"]

# Django Rest Framework
# https://www.django-rest-framework.org/

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
    ),
}

if PRODUCTION_MODE:
    from .prod import *
else:
    from dotenv import load_dotenv

    load_dotenv()
    from .dev import *

CDN_NAME = os.environ.get("CDN_NAME")
CDN_API_KEY = os.environ.get("CDN_API_KEY")
CDN_API_SECRET = os.environ.get("CDN_API_SECRET")

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_WPP_NUMBER = os.environ.get("TWILIO_WPP_NUMBER")

DB_HOST = os.environ.get("DB_HOST")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_PORT = os.environ.get("DB_PORT")

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    "SECRET_KEY", default="w%h-ok)&7l2e@1&ht!#ol3!!qg9zwz9hs$wf@fk4e0-7x1r*#d"
)

# Application definition

INSTALLED_APPS = [
    "frontend",
    "backend",
    "api",
    'channels',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "django_better_admin_arrayfield",
    "django_filters",
    "cloudinary",
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'dj_rest_auth',
    'dj_rest_auth.registration',
]

SITE_ID = 1

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "backend.middleware.cookie_auth_middleware.CookieAuthMiddleware",  # Custom middleware
    "django.contrib.auth.middleware.AuthenticationMiddleware",  # Authentication middleware
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]


ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ASGI_APPLICATION = "core.asgi.application"
WSGI_APPLICATION = "core.wsgi.application"

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

if os.getenv("TEST"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": DB_NAME,
            "USER": DB_USER,
            "PASSWORD": DB_PASSWORD,
            "HOST": DB_HOST,
            "PORT": DB_PORT,
        }
    }


# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = "en"

TIME_ZONE = "America/New_York"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static/")

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media/")

config(cloud_name=CDN_NAME, api_key=CDN_API_KEY, api_secret=CDN_API_SECRET, secure=True)

# Email
# https://docs.djangoproject.com/en/3.0/topics/email/

# Gmail SMTP requirements
# https://support.google.com/a/answer/176600?hl=en

EMAIL_BACKEND = (
    "django.core.mail.backends.smtp.EmailBackend"
    if PRODUCTION_MODE
    else "django.core.mail.backends.dummy.EmailBackend"
)
EMAIL_HOST = "smtp.gmail.com"
EMAIL_HOST_USER = os.environ.get("SMTP_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("SMTP_HOST_PASSWORD")
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False

ACCOUNT_EMAIL_REQUIRED = True  # Require email to register
ACCOUNT_EMAIL_VERIFICATION = 'none' #mandatory / optional / none

REST_AUTH = {
'SESSION_LOGIN': False
}

ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_ALL_ORIGINS = True

CORS_ORIGIN_WHITELIST = [
    'http://localhost:4000',
    'http://localhost:8000',
    'http://127.0.0.1:4000',
    'http://127.0.0.1:8000',
]

AUTH_USER_MODEL = 'backend.User' 

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_AUTH_REGISTER_SERIALIZERS = {
    'REGISTER_SERIALIZER': 'backend.serializers.RegisterSerializer',
}