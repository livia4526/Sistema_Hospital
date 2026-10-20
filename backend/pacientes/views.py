from rest_framework import filters, viewsets

from .models import Paciente
from .serializers import PacienteSerializer


class PacienteViewSet(viewsets.ModelViewSet):
    """Listar, buscar, cadastrar, ver, editar e apagar pacientes."""

    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome", "cpf"]  # /api/pacientes/?search=maria