from datetime import date, timedelta

from rest_framework.decorators import api_view
from rest_framework.response import Response

from agenda.models import Agendamento
from pacientes.models import Paciente

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


def plural(quantidade, singular, plural_):
    return singular if quantidade == 1 else plural_


def mensagem_de_aniversario(paciente):
    """Usa "a paciente" ou "o paciente" conforme o sexo cadastrado; sem sexo, uma frase neutra."""
    if paciente.sexo == Paciente.Sexo.FEMININO:
        return f"É o aniversário da paciente {paciente.nome} hoje!"
    if paciente.sexo == Paciente.Sexo.MASCULINO:
        return f"É o aniversário do paciente {paciente.nome} hoje!"
    return f"Hoje é aniversário de {paciente.nome}!"


@api_view(["GET"])
def alertas(request):
    """/api/painel/alertas/  ->  avisos do dia para a secretária"""
    hoje = date.today()
    amanha = hoje + timedelta(days=1)
    lista = []

    # 1) Cancelamentos de amanhã
    cancelados = Agendamento.objects.filter(data=amanha, status=Agendamento.Status.CANCELADA).count()
    if cancelados:
        lista.append({
            "tipo": "cancelamento",
            "mensagem": f"{cancelados} {plural(cancelados, 'paciente cancelou', 'pacientes cancelaram')} "
                        "a consulta de amanhã.",
        })

    # 2) Cirurgias de amanhã que o paciente ainda não confirmou
    sem_confirmacao = Agendamento.objects.filter(
        data=amanha, tipo=Agendamento.Tipo.CIRURGIA,
        status=Agendamento.Status.AGENDADA, confirmado=False,
    ).count()
    if sem_confirmacao:
        lista.append({
            "tipo": "confirmacao",
            "mensagem": f"{sem_confirmacao} {plural(sem_confirmacao, 'cirurgia agendada', 'cirurgias agendadas')} "
                        "para amanhã sem confirmação!",
        })

    # 3) Aniversariantes do dia
    aniversariantes = Paciente.objects.filter(
        data_nascimento__month=hoje.month, data_nascimento__day=hoje.day
    ).order_by("nome")
    for paciente in aniversariantes:
        lista.append({"tipo": "aniversario", "mensagem": mensagem_de_aniversario(paciente)})

    return Response(lista)
