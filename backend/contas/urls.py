from django.urls import path

from . import views

urlpatterns = [
    path("sessao/", views.sessao),
    path("entrar/", views.entrar),
    path("sair/", views.sair),
]
