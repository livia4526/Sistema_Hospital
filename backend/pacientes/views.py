from datetime import date

from django.db.models import Count, Max, Min, Q
from rest_framework import filters, viewsets

from .models import Paciente
from .serializers import PacienteSerializer


class PacienteViewSet(viewsets.ModelViewSet):
    """Listar, buscar, cadastrar, ver, editar e apagar pacientes."""

    serializer_class = PacienteSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome", "cpf"]  # /api/pacientes/?search=maria

    def get_queryset(self):
        # Junto com cada paciente, o banco já calcula os números dos cartões da busca
        hoje = date.today()
        return Paciente.objects.annotate(
            consultas_realizadas=Count(
                "agendamentos", filter=Q(agendamentos__status="realizada")
            ),
            ultima_consulta=Max(
                "agendamentos__data", filter=Q(agendamentos__status="realizada")
            ),
            proxima_consulta=Min(
                "agendamentos__data",
                filter=Q(agendamentos__status="agendada", agendamentos__data__gte=hoje),
            ),
        ).order_by("nome")
