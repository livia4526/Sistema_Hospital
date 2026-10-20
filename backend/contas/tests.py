from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class LoginTest(APITestCase):
    def setUp(self):
        User.objects.create_user("secretaria", password="senha-teste-123", first_name="Ana")

    def test_sem_login(self):
        resposta = self.client.get("/api/auth/sessao/")
        self.assertFalse(resposta.data["logado"])

    def test_senha_errada(self):
        resposta = self.client.post("/api/auth/entrar/", {"usuario": "secretaria", "senha": "errada"})
        self.assertEqual(resposta.status_code, 400)

    def test_entrar_e_sair(self):
        resposta = self.client.post(
            "/api/auth/entrar/", {"usuario": "secretaria", "senha": "senha-teste-123", "lembrar": True}
        )
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.data["usuario"]["nome"], "Ana")
        self.assertTrue(self.client.get("/api/auth/sessao/").data["logado"])
        self.client.post("/api/auth/sair/")
        self.assertFalse(self.client.get("/api/auth/sessao/").data["logado"])

    def test_sem_lembrar_expira_ao_fechar(self):
        self.client.post("/api/auth/entrar/", {"usuario": "secretaria", "senha": "senha-teste-123"})
        self.assertTrue(self.client.session.get_expire_at_browser_close())
