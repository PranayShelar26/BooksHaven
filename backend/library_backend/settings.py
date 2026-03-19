"""
Django settings for library_backend project.

- Session-based auth (Django login()) for React/Vite frontend
- CORS + CSRF trusted origins configured for cross-origin cookies
- Environment-variable friendly (safe for deployment)
- Replit deployment: Django serves React build (same-origin)
"""

from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / "subdir".
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from backend/ directory (optional; safe if file does not exist)
load_dotenv(BASE_DIR / ".env")

# -----------------
# Core settings
# -----------------
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
DEBUG = os.getenv("DEBUG", "1") == "1"

ALLOWED_HOSTS = [
    h.strip()
    for h in os.getenv(
        "ALLOWED_HOSTS",
        "127.0.0.1,localhost,bookshaven.onrender.com"  # ✅ Correct - no https://
    ).split(",")
    if h.strip()
]

# -------------------------
# Application definition
# -------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "books",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "library_backend.urls"


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],  # ✅ Empty - only for admin
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

WSGI_APPLICATION = "library_backend.wsgi.application"

# -------------
# Database
# -------------
if os.environ.get("DATABASE_URL"):
    DATABASES = {
        "default": dj_database_url.config(
            default=os.environ.get("DATABASE_URL"),
            conn_max_age=600
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# ----------------------
# Password validation
# ----------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

#
# ----------------------
# Internationalization
# ----------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ----------------
# Static / Media
# ----------------
STATIC_URL = "static/"

# Required for collectstatic
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# WhiteNoise storage
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ------------------------------------------------------------
# Session / CSRF / CORS (for React/Vite with cookies)
# ------------------------------------------------------------
# Cookies over HTTPS? (set to 1 in production)
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "0") == "1"
CSRF_COOKIE_SECURE = os.getenv("CSRF_COOKIE_SECURE", "0") == "1"

# SameSite handling
# - same-origin deploy (Replit single domain): "Lax" works
# - cross-site deploy (frontend and backend on different domains): use "None" + secure cookies
SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "None")  # Change from "Lax"
CSRF_COOKIE_SAMESITE = os.getenv("CSRF_COOKIE_SAMESITE", "None")  # Change from "Lax"

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_DOMAIN = None  # let browser manage it
SESSION_COOKIE_AGE = 1209600  # 14 days

# Allow frontend to send cookies (safe even for same-origin)
CORS_ALLOW_CREDENTIALS = True

# In same-origin deploy, CORS is not needed, but keeping it doesn't break anything.
# Provide safe defaults for local dev; override via env in production if you split domains.
CORS_ALLOW_ALL_ORIGINS = True
# avoid redirect-to-profile after login
LOGIN_REDIRECT_URL = "/admin/"