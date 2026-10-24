from datetime import date

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Paciente


class PacienteAPITest(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user("secretaria", password="senha-teste-123")
        self.client.force_login(self.usuario)
        self.dados = {
            "nome": "Maria Souza", "cpf": "12345678901", "data_nascimento": "1975-03-20",
            "celular": "79988887777", "plano": "unimed",
        }

    def test_precisa_estar_logado(self):
        self.client.logout()
        resposta = self.client.get("/api/pacientes/")
        self.assertEqual(resposta.status_code, 403)

    def test_cadastrar_e_listar(self):
        resposta = self.client.post("/api/pacientes/", self.dados)
        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(resposta.data["plano_nome"], "Unimed")
        lista = self.client.get("/api/pacientes/")
        self.assertEqual(len(lista.data), 1)

    def test_buscar_por_nome_ou_cpf(self):
        self.client.post("/api/pacientes/", self.dados)
        self.assertEqual(len(self.client.get("/api/pacientes/?search=maria").data), 1)
        self.assertEqual(len(self.client.get("/api/pacientes/?search=123456").data), 1)
        self.assertEqual(len(self.client.get("/api/pacientes/?search=joao").data), 0)

    def test_cpf_repetido(self):
        self.client.post("/api/pacientes/", self.dados)
        resposta = self.client.post("/api/pacientes/", self.dados)
        self.assertEqual(resposta.status_code, 400)
        self.assertIn("cpf", resposta.data)

    def test_plano_outros_sem_nome(self):
        resposta = self.client.post("/api/pacientes/", {**self.dados, "plano": "outros"})
        self.assertEqual(resposta.status_code, 400)
        self.assertIn("plano_outro", resposta.data)

    def test_editar_so_o_celular(self):
        criado = self.client.post("/api/pacientes/", self.dados).data
        resposta = self.client.patch(f"/api/pacientes/{criado['id']}/", {"celular": "79911112222"})
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(Paciente.objects.get().celular, "79911112222")

    def test_numeros_da_busca(self):
        from datetime import date, time, timedelta

        from agenda.models import Agendamento

        paciente = Paciente.objects.create(**{**self.dados, "data_nascimento": date(1975, 3, 20)})
        hoje = date.today()
        Agendamento.objects.create(paciente=paciente, tipo="consulta", data=hoje - timedelta(days=30),
                                   horario=time(8, 0), status="realizada")
        Agendamento.objects.create(paciente=paciente, tipo="consulta", data=hoje - timedelta(days=10),
                                   horario=time(8, 0), status="realizada")
        Agendamento.objects.create(paciente=paciente, tipo="consulta", data=hoje + timedelta(days=5),
                                   horario=time(8, 0))
        dados = self.client.get(f"/api/pacientes/{paciente.id}/").data
        self.assertEqual(dados["consultas_realizadas"], 2)
        self.assertEqual(dados["ultima_consulta"], (hoje - timedelta(days=10)).isoformat())
        self.assertEqual(dados["proxima_consulta"], (hoje + timedelta(days=5)).isoformat())
