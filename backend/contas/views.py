from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


def dados_do_usuario(usuario):
    return {
        "id": usuario.id,
        "usuario": usuario.username,
        "nome": usuario.get_full_name() or usuario.username,
    }


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def sessao(request):
    """Diz se há alguém logado. Também entrega o cookie de segurança (CSRF) ao navegador."""
    if request.user.is_authenticated:
        return Response({"logado": True, "usuario": dados_do_usuario(request.user)})
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
    return Response({"logado": True, "usuario": dados_do_usuario(usuario)})


@api_view(["POST"])
def sair(request):
    logout(request)
    return Response({"logado": False})
