import os
from importlib.util import find_spec
from datetime import timedelta
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse
from urllib.parse import urlparse
BASE_DIR = Path(__file__).resolve().parent.parent


# -------------------------------------------------------------------
# Core settings
# -------------------------------------------------------------------

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "dev-only-change-this-key-before-production-2026-erp",
)

DEBUG = os.getenv("DJANGO_DEBUG", "0") == "1"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "DJANGO_ALLOWED_HOSTS",
        "erp-project-s0nx.onrender.com,localhost,127.0.0.1",
    ).split(",")
    if host.strip()
]

if DEBUG:
    # Allow access through the laptop's LAN address during local development.
    ALLOWED_HOSTS = ["*"]


# -------------------------------------------------------------------
# Applications
# -------------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "django_filters",
    "drf_spectacular",

    "core",
]


# -------------------------------------------------------------------
# Middleware
# -------------------------------------------------------------------

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

WHITENOISE_INSTALLED = find_spec("whitenoise") is not None
if WHITENOISE_INSTALLED:
    MIDDLEWARE.insert(2, "whitenoise.middleware.WhiteNoiseMiddleware")


# -------------------------------------------------------------------
# URLs and templates
# -------------------------------------------------------------------

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# -------------------------------------------------------------------
# Database
# -------------------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if DATABASE_URL:
    database = urlparse(DATABASE_URL)
    query_options = {
        key: values[-1]
        for key, values in parse_qs(database.query).items()
        if values
    }
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": database.path.lstrip("/"),
            "USER": unquote(database.username or ""),
            "PASSWORD": unquote(database.password or ""),
            "HOST": database.hostname or "",
            "PORT": database.port or 5432,
            "CONN_MAX_AGE": 600,
            "CONN_HEALTH_CHECKS": True,
            "OPTIONS": query_options,
        }
    }
else:
    # SQLite is only for local development. Render supplies DATABASE_URL
    # for its persistent PostgreSQL database.
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# -------------------------------------------------------------------
# Authentication
# -------------------------------------------------------------------

AUTH_USER_MODEL = "core.User"

AUTH_PASSWORD_VALIDATORS = []


# -------------------------------------------------------------------
# Internationalization
# -------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Karachi"

USE_I18N = True
USE_TZ = True


# -------------------------------------------------------------------
# Static files
# -------------------------------------------------------------------

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": (
            "whitenoise.storage.CompressedStaticFilesStorage"
            if WHITENOISE_INSTALLED
            else "django.contrib.staticfiles.storage.StaticFilesStorage"
        ),
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# -------------------------------------------------------------------
# CORS and CSRF
# -------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        (
            "http://localhost:5173,"
            "http://127.0.0.1:5173,"
            "https://erp-project-green.vercel.app"
        ),
    ).split(",")
    if origin.strip()
]

CORS_ALLOWED_ORIGIN_REGEXES = (
    [
        r"^http://localhost:\d+$",
        r"^http://127\.0\.0\.1:\d+$",
        r"^http://192\.168\.\d{1,3}\.\d{1,3}:\d+$",
        r"^http://10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$",
        r"^http://172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$",
    ]
    if DEBUG
    else []
)

CSRF_TRUSTED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "CSRF_TRUSTED_ORIGINS",
        "https://erp-project-green.vercel.app",
    ).split(",")
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]


# -------------------------------------------------------------------
# Django REST Framework
# -------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}


# -------------------------------------------------------------------
# JWT
# -------------------------------------------------------------------

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}


# -------------------------------------------------------------------
# API documentation
# -------------------------------------------------------------------

SPECTACULAR_SETTINGS = {
    "TITLE": "Sabzi Mandi ERP API",
    "VERSION": "1.0.0",
}


# -------------------------------------------------------------------
# Production error logging
# -------------------------------------------------------------------

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}
