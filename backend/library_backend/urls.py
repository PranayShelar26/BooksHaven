from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView


def health(request):
    return JsonResponse({"status": "ok", "service": "BooksHaven backend"})


urlpatterns = [
    # Health check endpoint
    path("health/", health),

    # Django admin
    path("admin/", admin.site.urls),

    # API routes
    path("api/", include("books.urls")),
]

# Serve uploaded media in dev (and optionally in prod; Replit is fine)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all: serve React SPA for everything else (must be LAST)
# This enables React Router routes like /books/9, /borrowings, etc.
urlpatterns += [
    re_path(r"^(?!api/|admin/|media/|static/).*$", TemplateView.as_view(template_name="index.html")),
]