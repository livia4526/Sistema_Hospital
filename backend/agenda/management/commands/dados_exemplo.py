"""Cria pacientes e consultas de mentira para testar as telas.

Uso:  python manage.py dados_exemplo
Pode rodar mais de uma vez: o que já existe não é duplicado.
"""
from datetime import date, time, timedelta

from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand

from agenda.models import Agendamento
from pacientes.models import Paciente

PACIENTES = [
    # nome, cpf, nascimento, celular, plano
    ("Ana Beatriz Lima", "90000000001", date(1958, 3, 14), "79991110001", "unimed"),
    ("Carlos Eduardo Rocha", "90000000002", date(1972, 7, 2), "79991110002", "hapvida"),
    ("Joana Ferreira Santos", "90000000003", date(1985, 11, 23), "79991110003", "particular"),
    ("Marcos Vinícius Alves", "90000000004", date(1964, 1, 9), "79991110004", "bradesco"),
    ("Helena Costa Prado", "90000000005", date(1990, 6, 30), "79991110005", "plamed"),
    ("Roberto Nunes Dias", "90000000006", date(1949, 9, 17), "79991110006", "notredame"),
    ("Luíza Andrade Melo", "90000000007", date(2001, 4, 5), "79991110007", "unimed"),
    ("Paulo Henrique Souza", "90000000008", date(1978, 12, 12), "79991110008", "particular"),
]

# (horário, índice do paciente, motivo, é encaixe?)
AGENDA_HOJE = [
    (time(8, 0), 0, "Rotina", False),
    (time(8, 30), 1, "Retorno", False),
    (time(9, 0), 2, "Exame de vista", False),
    (time(9, 40), 3, "Pós-operatório", False),
    (time(10, 20), 4, "Rotina", False),
    (time(11, 0), 5, "Pressão no olho", False),
    (time(11, 30), 6, "Ardência", True),
    (time(14, 0), 7, "Rotina", False),
]
AGENDA_AMANHA = [
    (time(8, 0), 3, "Retorno", False),
    (time(9, 0), 6, "Exame de vista", False),
    (time(10, 0), 0, "Rotina", False),
]


class Command(BaseCommand):
    help = "Cria pacientes e consultas de exemplo para hoje e amanhã."

    def handle(self, *args, **opcoes):
        pacientes = []
        for nome, cpf, nascimento, celular, plano in PACIENTES:
            paciente, _ = Paciente.objects.get_or_create(
                cpf=cpf,
                defaults={"nome": nome, "data_nascimento": nascimento, "celular": celular, "plano": plano},
            )
            pacientes.append(paciente)

        hoje = date.today()

        # Um aniversariante no dia em que o comando roda, para aparecer nos alertas
        aniversariante, _ = Paciente.objects.get_or_create(
            cpf="90000000009",
            defaults={"nome": "Fernanda Oliveira", "sexo": "F", "celular": "79991110009", "plano": "unimed",
                      "data_nascimento": date(1983, 1, 1)},
        )
        ano = 1984 if (hoje.month, hoje.day) == (2, 29) else 1983  # 1984 teve 29 de fevereiro
        aniversariante.data_nascimento = date(ano, hoje.month, hoje.day)
        aniversariante.sexo = "F"
        aniversariante.save()

        criados = self.marcar(hoje, AGENDA_HOJE, pacientes)
        criados += self.marcar(hoje + timedelta(days=1), AGENDA_AMANHA, pacientes)

        # Um cancelamento amanhã, para aparecer nos alertas
        _, cancelamento_novo = Agendamento.objects.get_or_create(
            paciente=pacientes[5], data=hoje + timedelta(days=1), horario=time(11, 0),
            defaults={"tipo": "consulta", "status": "cancelada", "motivo": "Rotina"},
        )
        criados += int(cancelamento_novo)
        self.stdout.write(self.style.SUCCESS(
            f"Pronto: {len(pacientes)} pacientes de exemplo e {criados} consultas novas."
        ))

    def marcar(self, dia, agenda, pacientes):
        criados = 0
        for horario, indice, motivo, encaixe in agenda:
            consulta = Agendamento(
                paciente=pacientes[indice], tipo="consulta", data=dia,
                horario=horario, motivo=motivo, encaixe=encaixe,
            )
            try:
                consulta.full_clean()  # respeita todas as regras da agenda
            except ValidationError:
                continue  # horário já ocupado, dia de cirurgia etc.: pula
            consulta.save()
            criados += 1
        return criados
