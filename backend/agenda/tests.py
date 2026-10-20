from datetime import date, time

from django.core.exceptions import ValidationError
from django.test import TestCase

from pacientes.models import Paciente

from .models import LIMITE_CIRURGIAS, LIMITE_CONSULTAS, LIMITE_ENCAIXES, Agendamento

DIA = date(2030, 3, 4)


class RegrasDaAgendaTest(TestCase):
    """Cada teste confere uma regra do PDF de requisitos."""

    def setUp(self):
        # Roda antes de cada teste: cria um paciente de mentira
        self.paciente = Paciente.objects.create(
            nome="Paciente Teste", data_nascimento=date(1980, 5, 10),
            celular="79999999999", cpf="12345678901",
        )

    def novo(self, **campos):
        """Monta um agendamento de consulta com valores padrão."""
        dados = dict(paciente=self.paciente, tipo="consulta", data=DIA, horario=time(8, 0))
        dados.update(campos)
        return Agendamento(**dados)

    def salvar(self, **campos):
        ag = self.novo(**campos)
        ag.full_clean()  # roda todas as validações, igual ao formulário
        ag.save()
        return ag

    def horario_livre(self, i):
        """Horários diferentes a cada 20 minutos, a partir das 08:00."""
        minutos = 8 * 60 + i * 20
        return time(minutos // 60, minutos % 60)

    def test_consulta_valida_e_salva(self):
        self.salvar()
        self.assertEqual(Agendamento.objects.count(), 1)

    def test_horario_fora_do_expediente(self):
        with self.assertRaises(ValidationError):
            self.salvar(horario=time(19, 0))

    def test_horario_repetido_no_mesmo_dia(self):
        self.salvar(horario=time(9, 0))
        with self.assertRaises(ValidationError):
            self.salvar(horario=time(9, 0))

    def test_horario_repetido_pela_tela_sem_status(self):
        # A tela de marcar não mostra o campo status; a regra tem que valer mesmo assim
        self.salvar(horario=time(15, 0))
        ag = self.novo(horario=time(15, 0))
        with self.assertRaises(ValidationError):
            ag.full_clean(exclude=["status"])

    def test_horario_de_remarcada_fica_livre(self):
        self.salvar(horario=time(9, 0), status="remarcada")
        self.salvar(horario=time(9, 0))  # não pode dar erro

    def test_nao_mistura_consulta_e_cirurgia(self):
        self.salvar()
        with self.assertRaises(ValidationError):
            self.salvar(tipo="cirurgia", horario=time(10, 0), olho="OD", tipo_cirurgia="catarata")

    def test_cirurgia_exige_olho_e_tipo(self):
        with self.assertRaises(ValidationError):
            self.salvar(tipo="cirurgia")

    def test_cirurgia_so_em_hora_cheia(self):
        with self.assertRaises(ValidationError):
            self.salvar(tipo="cirurgia", horario=time(9, 30), olho="OE", tipo_cirurgia="miopia")

    def test_limite_de_consultas(self):
        for i in range(LIMITE_CONSULTAS):
            self.salvar(horario=self.horario_livre(i))
        with self.assertRaises(ValidationError):
            self.salvar(horario=self.horario_livre(LIMITE_CONSULTAS))
        # mas ainda cabe um encaixe
        self.salvar(horario=self.horario_livre(LIMITE_CONSULTAS), encaixe=True)

    def test_limite_de_encaixes(self):
        for i in range(LIMITE_ENCAIXES):
            self.salvar(horario=self.horario_livre(i), encaixe=True)
        with self.assertRaises(ValidationError):
            self.salvar(horario=self.horario_livre(LIMITE_ENCAIXES), encaixe=True)

    def test_limite_de_cirurgias(self):
        for i in range(LIMITE_CIRURGIAS):
            self.salvar(tipo="cirurgia", horario=time(8 + i, 0), olho="AO", tipo_cirurgia="catarata")
        with self.assertRaises(ValidationError):
            self.salvar(tipo="cirurgia", horario=time(8 + LIMITE_CIRURGIAS, 0),
                        olho="AO", tipo_cirurgia="catarata")


class ConsultaECirurgiaTest(TestCase):
    """As telas separadas preenchem o tipo sozinhas."""

    def setUp(self):
        self.paciente = Paciente.objects.create(
            nome="Paciente Teste", data_nascimento=date(1980, 5, 10),
            celular="79999999999", cpf="12345678901",
        )

    def test_consulta_preenche_o_tipo(self):
        from .models import Consulta
        c = Consulta(paciente=self.paciente, data=DIA, horario=time(9, 0))
        c.full_clean()
        c.save()
        self.assertEqual(c.tipo, "consulta")
        self.assertEqual(Consulta.objects.count(), 1)

    def test_cirurgia_preenche_o_tipo(self):
        from .models import Cirurgia, Consulta
        c = Cirurgia(paciente=self.paciente, data=DIA, horario=time(9, 0),
                     olho="OD", tipo_cirurgia="catarata")
        c.full_clean()
        c.save()
        self.assertEqual(c.tipo, "cirurgia")
        self.assertEqual(Cirurgia.objects.count(), 1)
        self.assertEqual(Consulta.objects.count(), 0)


class AgendamentoAPITest(TestCase):
    """A API usa as mesmas regras do modelo."""

    def setUp(self):
        from django.contrib.auth.models import User
        from rest_framework.test import APIClient

        self.client = APIClient()
        self.client.force_login(User.objects.create_user("secretaria", password="senha-teste-123"))
        self.paciente = Paciente.objects.create(
            nome="Paciente Teste", data_nascimento=date(1980, 5, 10),
            celular="79999999999", cpf="12345678901",
        )
        self.consulta = {
            "paciente": self.paciente.pk, "tipo": "consulta",
            "data": "2030-03-04", "horario": "09:00", "motivo": "Rotina",
        }

    def test_marcar_consulta(self):
        resposta = self.client.post("/api/agendamentos/", self.consulta)
        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(resposta.data["horario"], "09:00")
        self.assertEqual(resposta.data["paciente_nome"], "Paciente Teste")

    def test_status_sempre_comeca_agendada(self):
        resposta = self.client.post("/api/agendamentos/", {**self.consulta, "status": "realizada"})
        self.assertEqual(resposta.data["status"], "agendada")

    def test_horario_repetido_pela_api(self):
        self.client.post("/api/agendamentos/", self.consulta)
        resposta = self.client.post("/api/agendamentos/", self.consulta)
        self.assertEqual(resposta.status_code, 400)

    def test_marcar_falta_depois(self):
        criado = self.client.post("/api/agendamentos/", self.consulta).data
        resposta = self.client.patch(f"/api/agendamentos/{criado['id']}/", {"status": "falta"})
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.data["status_nome"], "Faltou")

    def test_filtrar_por_data(self):
        self.client.post("/api/agendamentos/", self.consulta)
        self.assertEqual(len(self.client.get("/api/agendamentos/?data=2030-03-04").data), 1)
        self.assertEqual(len(self.client.get("/api/agendamentos/?data=2030-03-05").data), 0)

    def test_horarios_livres(self):
        self.client.post("/api/agendamentos/", self.consulta)
        livres = self.client.get("/api/agendamentos/horarios-livres/?data=2030-03-04").data["horarios"]
        self.assertNotIn("09:00", livres)
        self.assertIn("08:00", livres)
        self.assertIn("18:00", livres)
        cirurgia = self.client.get(
            "/api/agendamentos/horarios-livres/?data=2030-03-05&tipo=cirurgia"
        ).data["horarios"]
        self.assertEqual(cirurgia[:3], ["08:00", "09:00", "10:00"])