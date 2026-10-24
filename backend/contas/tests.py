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


import io
import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image

PASTA_DE_TESTE = tempfile.mkdtemp()


def imagem_de_teste():
    arquivo = io.BytesIO()
    Image.new("RGB", (40, 40), "blue").save(arquivo, "PNG")
    return SimpleUploadedFile("foto.png", arquivo.getvalue(), content_type="image/png")


@override_settings(MEDIA_ROOT=PASTA_DE_TESTE)  # fotos dos testes vão para uma pasta temporária
class PerfilTest(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user("secretaria", password="senha-teste-123")
        self.client.force_login(self.usuario)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(PASTA_DE_TESTE, ignore_errors=True)
        super().tearDownClass()

    def test_perfil_vem_na_sessao_com_padroes(self):
        dados = self.client.get("/api/auth/sessao/").data["usuario"]
        self.assertEqual((dados["tema"], dados["tamanho_letra"], dados["cargo"]), ("claro", "normal", "Secretária"))

    def test_atualizar_nome_e_preferencias(self):
        resposta = self.client.patch(
            "/api/auth/perfil/",
            {"primeiro_nome": "Ana", "sobrenome": "Souza", "tema": "escuro", "tamanho_letra": "grande",
             "telefone": "(79) 99999-0000"},
            format="json",
        )
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.data["nome"], "Ana Souza")
        self.assertEqual(resposta.data["tema"], "escuro")
        self.assertEqual(resposta.data["telefone"], "79999990000")

    def test_email_e_tema_invalidos(self):
        resposta = self.client.patch("/api/auth/perfil/", {"email": "nao-e-email", "tema": "roxo"}, format="json")
        self.assertEqual(resposta.status_code, 400)
        self.assertIn("email", resposta.data)
        self.assertIn("tema", resposta.data)

    def test_enviar_e_tirar_foto(self):
        resposta = self.client.post("/api/auth/perfil/foto/", {"foto": imagem_de_teste()}, format="multipart")
        self.assertEqual(resposta.status_code, 200)
        self.assertTrue(resposta.data["foto"].startswith("/media/fotos/"))
        resposta = self.client.delete("/api/auth/perfil/foto/")
        self.assertIsNone(resposta.data["foto"])

    def test_arquivo_que_nao_e_imagem(self):
        falso = SimpleUploadedFile("foto.png", b"isto nao e imagem", content_type="image/png")
        resposta = self.client.post("/api/auth/perfil/foto/", {"foto": falso}, format="multipart")
        self.assertEqual(resposta.status_code, 400)

    def test_trocar_senha(self):
        errada = self.client.post("/api/auth/senha/", {"atual": "outra", "nova": "NovaSenha!2026"}, format="json")
        self.assertEqual(errada.status_code, 400)
        fraca = self.client.post("/api/auth/senha/", {"atual": "senha-teste-123", "nova": "123"}, format="json")
        self.assertEqual(fraca.status_code, 400)
        certa = self.client.post(
            "/api/auth/senha/", {"atual": "senha-teste-123", "nova": "NovaSenha!2026"}, format="json"
        )
        self.assertEqual(certa.status_code, 200)
        self.assertTrue(self.client.get("/api/auth/sessao/").data["logado"])  # continua logada
