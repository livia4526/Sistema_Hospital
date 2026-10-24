from django.urls import path

from . import views

urlpatterns = [
    path("sessao/", views.sessao),
    path("entrar/", views.entrar),
    path("sair/", views.sair),
    path("perfil/", views.atualizar_perfil),
    path("perfil/foto/", views.foto_do_perfil),
    path("senha/", views.trocar_senha),
]
