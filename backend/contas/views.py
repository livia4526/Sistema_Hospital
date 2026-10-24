from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import ensure_csrf_cookie
from PIL import Image, UnidentifiedImageError
from rest_framework.decorators import api_view, authentication_classes, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Perfil

MAXIMO_FOTO_MB = 3


def dados_do_usuario(request, usuario):
    perfil = Perfil.de(usuario)
    return {
        "id": usuario.id,
        "usuario": usuario.username,
        "nome": usuario.get_full_name() or usuario.username,
        "primeiro_nome": usuario.first_name,
        "sobrenome": usuario.last_name,
        "email": usuario.email,
        "cargo": perfil.cargo,
        "telefone": perfil.telefone,
        "foto": perfil.foto.url if perfil.foto else None,
        "tema": perfil.tema,
        "tamanho_letra": perfil.tamanho_letra,
    }


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def sessao(request):
    """Diz se há alguém logado. Também entrega o cookie de segurança (CSRF) ao navegador."""
    if request.user.is_authenticated:
        return Response({"logado": True, "usuario": dados_do_usuario(request, request.user)})
    return Response({"logado": False})


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def entrar(request):
    usuario = authenticate(
        request,
        username=request.data.get("usuario", ""),
        password=request.data.get("senha", ""),
    )
    if usuario is None:
        return Response({"erro": "Usuário ou senha incorretos."}, status=400)

    login(request, usuario)
    if not request.data.get("lembrar"):
        request.session.set_expiry(0)  # sem "Lembre-se de mim": sai ao fechar o navegador
    return Response({"logado": True, "usuario": dados_do_usuario(request, usuario)})


@api_view(["POST"])
def sair(request):
    logout(request)
    return Response({"logado": False})


@api_view(["PATCH"])
def atualizar_perfil(request):
    """PATCH /api/auth/perfil/  ->  muda nome, e-mail, cargo, telefone, tema e tamanho da letra"""
    usuario = request.user
    perfil = Perfil.de(usuario)
    dados = request.data
    erros = {}

    if "primeiro_nome" in dados:
        usuario.first_name = str(dados["primeiro_nome"]).strip()[:150]
    if "sobrenome" in dados:
        usuario.last_name = str(dados["sobrenome"]).strip()[:150]
    if "email" in dados:
        usuario.email = str(dados["email"]).strip()
    if "cargo" in dados:
        perfil.cargo = str(dados["cargo"]).strip()[:80]
    if "telefone" in dados:
        perfil.telefone = "".join(c for c in str(dados["telefone"]) if c.isdigit())[:11]
    if "tema" in dados:
        if dados["tema"] in Perfil.Tema.values:
            perfil.tema = dados["tema"]
        else:
            erros["tema"] = "Tema inválido."
    if "tamanho_letra" in dados:
        if dados["tamanho_letra"] in Perfil.TamanhoLetra.values:
            perfil.tamanho_letra = dados["tamanho_letra"]
        else:
            erros["tamanho_letra"] = "Tamanho inválido."

    try:
        usuario.full_clean(exclude=["password", "username"])  # confere o formato do e-mail
    except ValidationError as erro:
        erros.update({campo: " ".join(msgs) for campo, msgs in erro.message_dict.items()})
    if erros:
        return Response(erros, status=400)

    usuario.save()
    perfil.save()
    return Response(dados_do_usuario(request, usuario))


@api_view(["POST", "DELETE"])
@parser_classes([MultiPartParser])
def foto_do_perfil(request):
    """POST envia uma foto nova (campo "foto"); DELETE tira a foto."""
    perfil = Perfil.de(request.user)
    if request.method == "DELETE":
        perfil.foto.delete(save=True)
        return Response(dados_do_usuario(request, request.user))

    arquivo = request.FILES.get("foto")
    if not arquivo:
        return Response({"foto": "Escolha uma imagem."}, status=400)
    if arquivo.size > MAXIMO_FOTO_MB * 1024 * 1024:
        return Response({"foto": f"A foto deve ter no máximo {MAXIMO_FOTO_MB} MB."}, status=400)

    # Confere se o arquivo é mesmo uma imagem (e não outro arquivo com nome de .png)
    try:
        Image.open(arquivo).verify()
    except (UnidentifiedImageError, OSError):
        return Response({"foto": "O arquivo enviado não é uma imagem válida."}, status=400)
    arquivo.seek(0)  # volta ao começo do arquivo para salvar

    perfil.foto.delete(save=False)  # apaga a foto antiga do disco
    perfil.foto = arquivo
    perfil.save()
    return Response(dados_do_usuario(request, request.user))


@api_view(["POST"])
def trocar_senha(request):
    """POST /api/auth/senha/  {"atual": "...", "nova": "..."}"""
    usuario = request.user
    if not usuario.check_password(request.data.get("atual", "")):
        return Response({"atual": "A senha atual está incorreta."}, status=400)
    nova = request.data.get("nova", "")
    try:
        validate_password(nova, usuario)  # regras de senha do Django (tamanho, muito comum...)
    except ValidationError as erro:
        return Response({"nova": " ".join(erro.messages)}, status=400)
    usuario.set_password(nova)
    usuario.save()
    update_session_auth_hash(request, usuario)  # continua logada depois de trocar a senha
    return Response({"ok": True})
