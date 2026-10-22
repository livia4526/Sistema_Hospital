from datetime import date, time

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from agenda.models import Agendamento
from pacientes.models import Paciente

from .models import MetaMensal


class MetasTest(APITestCase):
    def setUp(self):
        self.client.force_login(User.objects.create_user("secretaria", password="senha-teste-123"))
        self.paciente = Paciente.objects.create(
            nome="Paciente Teste", data_nascimento=date(1980, 5, 10),
            celular="79999999999", cpf="12345678901",
        )

    def test_cria_meta_padrao_do_mes(self):
        resposta = self.client.get("/api/painel/metas/")
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.data["consultas"]["meta"], 200)
        self.assertEqual(resposta.data["cirurgias"]["meta"], 50)
        self.assertEqual(MetaMensal.objects.count(), 1)

    def test_mes_novo_copia_os_alvos_do_anterior(self):
        MetaMensal.objects.create(ano=2030, mes=1, meta_consultas=180, meta_cirurgias=40)
        nova = MetaMensal.do_mes(2030, 2)
        self.assertEqual((nova.meta_consultas, nova.meta_cirurgias), (180, 40))

    def test_conta_so_as_realizadas_do_mes(self):
        hoje = date.today()
        Agendamento.objects.create(paciente=self.paciente, tipo="consulta", data=hoje,
                                   horario=time(8, 0), status="realizada")
        Agendamento.objects.create(paciente=self.paciente, tipo="consulta", data=hoje,
                                   horario=time(9, 0), status="falta")
        Agendamento.objects.create(paciente=self.paciente, tipo="consulta", data=hoje,
                                   horario=time(10, 0))
        resposta = self.client.get("/api/painel/metas/")
        self.assertEqual(resposta.data["consultas"]["realizadas"], 1)

    def test_cumprimento_das_metas(self):
        hoje = date.today()
        MetaMensal.objects.create(ano=hoje.year, mes=hoje.month, meta_consultas=2, meta_cirurgias=2)
        Agendamento.objects.create(paciente=self.paciente, tipo="consulta", data=hoje,
                                   horario=time(8, 0), status="realizada")
        resposta = self.client.get("/api/painel/metas/").data
        self.assertEqual(resposta["consultas"]["cumprimento"], 50.0)
        self.assertEqual(resposta["cirurgias"]["cumprimento"], 0)
        self.assertEqual(resposta["geral"]["realizadas"], 1)
        self.assertEqual(resposta["geral"]["meta"], 4)
        self.assertEqual(resposta["geral"]["cumprimento"], 25.0)

    def test_cumprimento_pode_passar_de_100(self):
        from .views import cumprimento
        self.assertEqual(cumprimento(220, 200), 110.0)
        self.assertEqual(cumprimento(199, 200), 99.5)
