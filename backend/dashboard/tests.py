from datetime import date, time, timedelta

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


class AlertasTest(APITestCase):
    def setUp(self):
        self.client.force_login(User.objects.create_user("secretaria", password="senha-teste-123"))
        self.hoje = date.today()
        self.amanha = self.hoje + timedelta(days=1)
        self.paciente = Paciente.objects.create(
            nome="João Silva", data_nascimento=self.hoje.replace(year=1980),
            celular="79999999999", cpf="12345678901",
        )

    def mensagens(self):
        return [a["mensagem"] for a in self.client.get("/api/painel/alertas/").data]

    def test_aniversariante_sem_sexo_usa_frase_neutra(self):
        self.assertIn("Hoje é aniversário de João Silva!", self.mensagens())

    def test_aniversariante_masculino_e_feminino(self):
        self.paciente.sexo = "M"
        self.paciente.save()
        Paciente.objects.create(
            nome="Maria Souza", sexo="F", data_nascimento=self.hoje.replace(year=1990),
            celular="79988888888", cpf="10987654321",
        )
        mensagens = self.mensagens()
        self.assertIn("É o aniversário do paciente João Silva hoje!", mensagens)
        self.assertIn("É o aniversário da paciente Maria Souza hoje!", mensagens)

    def test_cancelamentos_de_amanha(self):
        Agendamento.objects.create(paciente=self.paciente, tipo="consulta", data=self.amanha,
                                   horario=time(8, 0), status="cancelada")
        self.assertIn("1 paciente cancelou a consulta de amanhã.", self.mensagens())

    def test_cirurgias_sem_confirmacao(self):
        for hora, confirmado in [(8, False), (9, False), (10, True)]:
            Agendamento.objects.create(paciente=self.paciente, tipo="cirurgia", data=self.amanha,
                                       horario=time(hora, 0), olho="OD", tipo_cirurgia="catarata",
                                       confirmado=confirmado)
        self.assertIn("2 cirurgias agendadas para amanhã sem confirmação!", self.mensagens())
