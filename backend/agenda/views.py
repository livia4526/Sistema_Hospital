from datetime import date, datetime, timedelta

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    HORARIO_FIM, HORARIO_INICIO, INTERVALO_CIRURGIA, INTERVALO_CONSULTA,
    LIMITE_CIRURGIAS, LIMITE_CONSULTAS, LIMITE_ENCAIXES, Agendamento,
)

NOMES_DOS_DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
DIAS_DE_ATENDIMENTO = 6  # de segunda a sábado


def nivel_de_ocupacao(porcentagem):
    """Regra do PDF: até 50% tranquilo, de 51% a 80% moderado, 81% ou mais cheio."""
    if porcentagem <= 50:
        return "tranquilo"
    if porcentagem <= 80:
        return "moderado"
    return "cheio"
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
        """/api/agendamentos/horarios-livres/?data=2026-10-20&tipo=consulta&encaixe=1"""
        texto_data = request.query_params.get("data")
        tipo = request.query_params.get("tipo", "consulta")
        if not texto_data:
            return Response({"erro": "Informe a data, ex.: ?data=2026-10-20"}, status=400)
        try:
            dia = date.fromisoformat(texto_data)
        except ValueError:
            return Response({"erro": "Data inválida. Use o formato 2026-10-20."}, status=400)

        encaixe = request.query_params.get("encaixe") in ("1", "true")
        if dia < date.today():
            return Response({"data": texto_data, "tipo": tipo, "horarios": [],
                             "aviso": "Esta data já passou."})
        problema = Agendamento.problema_no_dia(dia, tipo, encaixe)
        if problema:
            return Response({"data": texto_data, "tipo": tipo, "horarios": [], "aviso": problema})

        ocupados = set(
            Agendamento.objects.filter(data=dia, status__in=Agendamento.STATUS_ATIVOS)
            .values_list("horario", flat=True)
        )
        passo = timedelta(minutes=INTERVALO_CIRURGIA if tipo == "cirurgia" else INTERVALO_CONSULTA)
        atual = datetime.combine(dia, HORARIO_INICIO)
        fim = datetime.combine(dia, HORARIO_FIM)

        # Hoje, os horários que já passaram não aparecem
        agora = timezone.localtime().time() if dia == date.today() else None

        livres = []
        while atual <= fim:
            horario = atual.time()
            if horario not in ocupados and (agora is None or horario > agora):
                livres.append(atual.strftime("%H:%M"))
            atual += passo
        return Response({"data": texto_data, "tipo": tipo, "horarios": livres, "aviso": None})

    @action(detail=False)
    def resumo(self, request):
        """/api/agendamentos/resumo/?data=2026-10-20  ->  números do bloco "Hoje" do painel"""
        texto_data = request.query_params.get("data") or date.today().isoformat()
        try:
            dia = date.fromisoformat(texto_data)
        except ValueError:
            return Response({"erro": "Data inválida. Use o formato 2026-10-20."}, status=400)

        do_dia = Agendamento.objects.filter(data=dia, status__in=Agendamento.STATUS_ATIVOS)
        return Response({
            "data": texto_data,
            "total": do_dia.count(),
            "compareceram": do_dia.filter(status=Agendamento.Status.REALIZADA).count(),
            "faltaram": do_dia.filter(status=Agendamento.Status.FALTA).count(),
            "pendentes": do_dia.filter(status=Agendamento.Status.AGENDADA).count(),
        })

    @action(detail=False)
    def semana(self, request):
        """/api/agendamentos/semana/?semana=0  ->  ocupação de cada dia (0 = esta semana, 1 = a próxima...)"""
        try:
            deslocamento = int(request.query_params.get("semana", 0))
        except ValueError:
            return Response({"erro": "O parâmetro semana deve ser um número."}, status=400)

        hoje = date.today()
        segunda = hoje - timedelta(days=hoje.weekday()) + timedelta(weeks=deslocamento)
        dias = []
        for i in range(DIAS_DE_ATENDIMENTO):
            dia = segunda + timedelta(days=i)
            ativos = Agendamento.objects.filter(data=dia, status__in=Agendamento.STATUS_ATIVOS)
            consultas = ativos.filter(tipo=Agendamento.Tipo.CONSULTA).count()
            cirurgias = ativos.filter(tipo=Agendamento.Tipo.CIRURGIA).count()

            # Um dia é só de consultas ou só de cirurgias, então a capacidade depende do tipo
            if cirurgias:
                tipo, ocupados, capacidade = "cirurgia", cirurgias, LIMITE_CIRURGIAS
            else:
                tipo, ocupados, capacidade = "consulta", consultas, LIMITE_CONSULTAS + LIMITE_ENCAIXES
            porcentagem = round(ocupados / capacidade * 100)

            dias.append({
                "data": dia.isoformat(),
                "nome": NOMES_DOS_DIAS[dia.weekday()],
                "tipo": tipo if ocupados else None,
                "quantidade": ocupados,
                "ocupacao": porcentagem,
                "nivel": nivel_de_ocupacao(porcentagem),
                "eh_hoje": dia == hoje,
            })
        return Response({"inicio": segunda.isoformat(), "dias": dias})

    @action(detail=True, methods=["post"])
    def remarcar(self, request, pk=None):
        """POST /api/agendamentos/5/remarcar/  {"data": "2026-11-03", "horario": "09:00"}
        O agendamento antigo fica como "remarcada" (cinza) e um novo é criado, ligado a ele."""
        antigo = self.get_object()
        if antigo.status != Agendamento.Status.AGENDADA:
            return Response({"erro": "Só dá para remarcar um agendamento que ainda vai acontecer."}, status=400)

        novo = Agendamento(
            paciente=antigo.paciente, tipo=antigo.tipo, encaixe=False,
            data=request.data.get("data"), horario=request.data.get("horario"),
            motivo=antigo.motivo, olho=antigo.olho, tipo_cirurgia=antigo.tipo_cirurgia,
            precaucoes=antigo.precaucoes, observacao=antigo.observacao, remarcado_de=antigo,
        )
        # transaction.atomic: ou as duas mudanças acontecem, ou nenhuma
        with transaction.atomic():
            antigo.status = Agendamento.Status.REMARCADA
            antigo.save(update_fields=["status"])  # libera o horário antigo antes de validar o novo
            try:
                novo.full_clean()
            except ValidationError as erro:
                transaction.set_rollback(True)  # desfaz a mudança no antigo
                return Response(erro.message_dict, status=400)
            novo.save()
        return Response(self.get_serializer(novo).data, status=201)
