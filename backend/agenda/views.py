from datetime import date, datetime, timedelta

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    HORARIO_FIM, HORARIO_INICIO, INTERVALO_CIRURGIA, INTERVALO_CONSULTA, Agendamento,
)
from .serializers import AgendamentoSerializer


class AgendamentoViewSet(viewsets.ModelViewSet):
    """Consultas e cirurgias. Filtros: ?data=2026-10-20 &tipo=consulta &paciente=3 &status=agendada"""

    serializer_class = AgendamentoSerializer
    queryset = Agendamento.objects.select_related("paciente")

    def get_queryset(self):
        consulta = super().get_queryset()
        filtros = {}
        for campo in ["data", "tipo", "paciente", "status"]:
            valor = self.request.query_params.get(campo)
            if valor:
                filtros[campo] = valor
        return consulta.filter(**filtros)

    @action(detail=False, url_path="horarios-livres")
    def horarios_livres(self, request):
        """/api/agendamentos/horarios-livres/?data=2026-10-20&tipo=consulta"""
        texto_data = request.query_params.get("data")
        tipo = request.query_params.get("tipo", "consulta")
        if not texto_data:
            return Response({"erro": "Informe a data, ex.: ?data=2026-10-20"}, status=400)
        try:
            dia = date.fromisoformat(texto_data)
        except ValueError:
            return Response({"erro": "Data inválida. Use o formato 2026-10-20."}, status=400)

        ocupados = set(
            Agendamento.objects.filter(data=dia, status__in=Agendamento.STATUS_ATIVOS)
            .values_list("horario", flat=True)
        )
        passo = timedelta(minutes=INTERVALO_CIRURGIA if tipo == "cirurgia" else INTERVALO_CONSULTA)
        atual = datetime.combine(dia, HORARIO_INICIO)
        fim = datetime.combine(dia, HORARIO_FIM)

        livres = []
        while atual <= fim:
            if atual.time() not in ocupados:
                livres.append(atual.strftime("%H:%M"))
            atual += passo
        return Response({"data": texto_data, "tipo": tipo, "horarios": livres})