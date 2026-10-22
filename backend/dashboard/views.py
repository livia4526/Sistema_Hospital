from datetime import date

from rest_framework.decorators import api_view
from rest_framework.response import Response

from agenda.models import Agendamento

from .models import MetaMensal


def cumprimento(realizado, meta):
    """Quanto da meta foi cumprido, em %. Pode passar de 100 quando a clínica supera o planejado."""
    if meta == 0:
        return 0
    return round(realizado / meta * 100, 1)


@api_view(["GET"])
def metas_do_mes(request):
    """/api/painel/metas/  ->  metas do mês atual e quanto já foi cumprido"""
    hoje = date.today()
    meta = MetaMensal.do_mes(hoje.year, hoje.month)

    realizados = Agendamento.objects.filter(
        data__year=hoje.year, data__month=hoje.month, status=Agendamento.Status.REALIZADA
    )
    consultas = realizados.filter(tipo=Agendamento.Tipo.CONSULTA).count()
    cirurgias = realizados.filter(tipo=Agendamento.Tipo.CIRURGIA).count()

    # Geral = tudo que foi realizado ÷ tudo que foi planejado
    total_realizado = consultas + cirurgias
    total_meta = meta.meta_consultas + meta.meta_cirurgias

    return Response({
        "ano": meta.ano,
        "mes": meta.mes,
        "consultas": {
            "realizadas": consultas,
            "meta": meta.meta_consultas,
            "cumprimento": cumprimento(consultas, meta.meta_consultas),
        },
        "cirurgias": {
            "realizadas": cirurgias,
            "meta": meta.meta_cirurgias,
            "cumprimento": cumprimento(cirurgias, meta.meta_cirurgias),
        },
        "geral": {
            "realizadas": total_realizado,
            "meta": total_meta,
            "cumprimento": cumprimento(total_realizado, total_meta),
        },
    })
