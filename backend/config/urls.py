from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from agenda.views import AgendamentoViewSet
from pacientes.views import PacienteViewSet

# O router cria sozinho os endereços de cada ViewSet
router = DefaultRouter()
router.register("pacientes", PacienteViewSet)
router.register("agendamentos", AgendamentoViewSet, basename="agendamento")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api-auth/", include("rest_framework.urls")),  # login da página da API
]