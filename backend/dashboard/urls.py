from django.urls import path

from . import views

urlpatterns = [
    path("metas/", views.metas_do_mes),
    path("alertas/", views.alertas),
]
