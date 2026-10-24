from django.conf import settings
from django.db import models


class Perfil(models.Model):
    """Dados extras de cada usuário do sistema (a secretária) e as preferências da tela."""

    class Tema(models.TextChoices):
        CLARO = "claro", "Claro"
        ESCURO = "escuro", "Escuro"
        SISTEMA = "sistema", "Igual ao do computador"

    class TamanhoLetra(models.TextChoices):
        PEQUENA = "pequena", "Pequena"
        NORMAL = "normal", "Normal"
        GRANDE = "grande", "Grande"
        MUITO_GRANDE = "muito_grande", "Muito grande"

    # OneToOne: cada usuário tem um perfil, e cada perfil é de um usuário
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="perfil"
    )
    foto = models.ImageField("foto", upload_to="fotos/", blank=True)
    cargo = models.CharField("cargo", max_length=80, blank=True, default="Secretária")
    telefone = models.CharField("telefone", max_length=11, blank=True)
    tema = models.CharField("tema", max_length=10, choices=Tema.choices, default=Tema.CLARO)
    tamanho_letra = models.CharField(
        "tamanho da letra", max_length=15, choices=TamanhoLetra.choices, default=TamanhoLetra.NORMAL
    )

    class Meta:
        verbose_name = "perfil"
        verbose_name_plural = "perfis"

    def __str__(self):
        return f"Perfil de {self.usuario}"

    @classmethod
    def de(cls, usuario):
        """Busca o perfil do usuário; se ainda não existir, cria na hora."""
        perfil, _ = cls.objects.get_or_create(usuario=usuario)
        return perfil
