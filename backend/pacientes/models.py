from datetime import date

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models

# Validadores: conferem o formato antes de salvar
cpf_validator = RegexValidator(
    regex=r"^\d{11}$",
    message="O CPF deve ter exatamente 11 números (sem pontos e traço).",
)
celular_validator = RegexValidator(
    regex=r"^\d{10,11}$",
    message="O celular deve ter DDD + número, só números (10 ou 11 dígitos).",
)


class Paciente(models.Model):
    # Opções fixas: o primeiro valor vai para o banco, o segundo aparece na tela
    class Sexo(models.TextChoices):
        FEMININO = "F", "Feminino"
        MASCULINO = "M", "Masculino"
        OUTRO = "O", "Outro"

    class Plano(models.TextChoices):
        UNIMED = "unimed", "Unimed"
        HAPVIDA = "hapvida", "Hapvida"
        BRADESCO = "bradesco", "Bradesco"
        PLAMED = "plamed", "Plamed"
        NOTREDAME = "notredame", "NotreDame"
        PARTICULAR = "particular", "Particular"
        OUTROS = "outros", "Outros"

    nome = models.CharField("nome", max_length=150)
    data_nascimento = models.DateField("data de nascimento")
    sexo = models.CharField("sexo", max_length=1, choices=Sexo.choices, blank=True)
    plano = models.CharField(
        "plano de saúde", max_length=20, choices=Plano.choices, default=Plano.PARTICULAR
    )
    plano_outro = models.CharField(
        "qual plano?", max_length=60, blank=True,
        help_text="Preencha só quando o plano for 'Outros'.",
    )
    celular = models.CharField("celular", max_length=11, validators=[celular_validator])
    email = models.EmailField("e-mail", blank=True)
    cpf = models.CharField("CPF", max_length=11, unique=True, validators=[cpf_validator])
    informacoes_complementares = models.TextField(
        "informações complementares", blank=True,
        help_text="Ex.: Diabético, Hipertenso, Alérgico",
    )
    criado_em = models.DateTimeField("cadastrado em", auto_now_add=True)

    class Meta:
        verbose_name = "paciente"
        verbose_name_plural = "pacientes"
        ordering = ["nome"]

    def __str__(self):
        return self.nome

    @property
    def idade(self):
        hoje = date.today()
        anos = hoje.year - self.data_nascimento.year
        fez_aniversario = (hoje.month, hoje.day) >= (
            self.data_nascimento.month, self.data_nascimento.day
        )
        return anos if fez_aniversario else anos - 1

    def clean(self):
        # Regras que envolvem mais de um campo
        if self.plano == self.Plano.OUTROS and not self.plano_outro:
            raise ValidationError({"plano_outro": "Informe qual é o plano."})
        if self.plano != self.Plano.OUTROS:
            self.plano_outro = ""
        if self.data_nascimento and self.data_nascimento > date.today():
            raise ValidationError({"data_nascimento": "A data de nascimento não pode ser no futuro."})