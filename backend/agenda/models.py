from datetime import date, time

from django.core.exceptions import ValidationError
from django.db import models

from pacientes.models import Paciente

# ===== Regras do consultório (mudou a regra? muda só aqui) =====
LIMITE_CONSULTAS = 20  # consultas normais por dia
LIMITE_ENCAIXES = 5    # encaixes por dia
LIMITE_CIRURGIAS = 6   # cirurgias por dia
HORARIO_INICIO = time(8, 0)
HORARIO_FIM = time(18, 0)
INTERVALO_CONSULTA = 10  # minutos entre um horário de consulta e o próximo
INTERVALO_CIRURGIA = 60  # cirurgias só em horas cheias


class Agendamento(models.Model):
    class Tipo(models.TextChoices):
        CONSULTA = "consulta", "Consulta"
        CIRURGIA = "cirurgia", "Cirurgia"

    class Status(models.TextChoices):
        AGENDADA = "agendada", "Agendada"
        REALIZADA = "realizada", "Realizada"
        FALTA = "falta", "Faltou"
        REMARCADA = "remarcada", "Remarcada"
        CANCELADA = "cancelada", "Cancelada"

    class Olho(models.TextChoices):
        OD = "OD", "OD - Olho direito"
        OE = "OE", "OE - Olho esquerdo"
        AO = "AO", "AO - Ambos os olhos"

    class TipoCirurgia(models.TextChoices):
        CATARATA = "catarata", "Catarata"
        MIOPIA = "miopia", "Miopia"
        GLAUCOMA = "glaucoma", "Glaucoma"
        RETINA = "retina", "Retina"
        ESTRABISMO = "estrabismo", "Estrabismo"
        CORNEA = "cornea", "Córnea"
        OUTROS = "outros", "Outros"

    # Status que ocupam um horário (remarcada e cancelada liberam a vaga)
    STATUS_ATIVOS = [Status.AGENDADA, Status.REALIZADA, Status.FALTA]

    # ----- Campos comuns -----
    paciente = models.ForeignKey(
        Paciente, on_delete=models.PROTECT,
        related_name="agendamentos", verbose_name="paciente",
    )
    tipo = models.CharField("tipo", max_length=10, choices=Tipo.choices)
    data = models.DateField("data")
    horario = models.TimeField("horário")
    status = models.CharField(
        "status", max_length=10, choices=Status.choices, default=Status.AGENDADA
    )
    encaixe = models.BooleanField("encaixe", default=False)
    confirmado = models.BooleanField(
        "confirmado pelo paciente", default=False,
        help_text="O paciente confirmou que vem (por telefone, WhatsApp...).",
    )
    observacao = models.TextField("observação", blank=True)

    # ----- Só para consulta -----
    motivo = models.CharField("motivo", max_length=200, blank=True)

    # ----- Só para cirurgia -----
    olho = models.CharField("olho", max_length=2, choices=Olho.choices, blank=True)
    tipo_cirurgia = models.CharField(
        "tipo de cirurgia", max_length=20, choices=TipoCirurgia.choices, blank=True
    )
    precaucoes = models.TextField("precauções", blank=True, help_text="Jejum, preparos...")

    # ----- Controle -----
    remarcado_de = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="remarcacoes", verbose_name="remarcado de",
    )
    criado_em = models.DateTimeField("criado em", auto_now_add=True)

    class Meta:
        verbose_name = "agendamento"
        verbose_name_plural = "agendamentos"
        ordering = ["data", "horario"]
        constraints = [
            # O banco também impede dois agendamentos ativos no mesmo dia e horário
            models.UniqueConstraint(
                fields=["data", "horario"],
                condition=models.Q(status__in=["agendada", "realizada", "falta"]),
                name="horario_unico_por_dia",
                violation_error_message="Já existe um agendamento neste dia e horário.",
            ),
        ]

    def __str__(self):
        return f"{self.data:%d/%m/%Y} {self.horario:%H:%M} - {self.paciente} ({self.get_tipo_display()})"

    def ativos_do_dia(self):
        """Agendamentos que ocupam vaga no mesmo dia, sem contar este."""
        return (
            Agendamento.objects.filter(data=self.data, status__in=self.STATUS_ATIVOS)
            .exclude(pk=self.pk)
        )

    def clean(self):
        erros = {}

        # 0) Não dá para marcar um agendamento novo num dia que já passou
        if self.pk is None and self.data and self.data < date.today():
            erros["data"] = "Não é possível agendar em uma data que já passou."

        # 1) Horário de funcionamento
        if self.horario and not (HORARIO_INICIO <= self.horario <= HORARIO_FIM):
            erros["horario"] = "O horário deve ser entre 08:00 e 18:00."

        # 2) Campos que dependem do tipo
        if self.tipo == self.Tipo.CIRURGIA:
            if not self.olho:
                erros["olho"] = "Informe qual olho será operado."
            if not self.tipo_cirurgia:
                erros["tipo_cirurgia"] = "Informe o tipo de cirurgia."
            if self.horario and self.horario.minute != 0:
                erros["horario"] = "Cirurgias só podem ser marcadas em horas cheias (ex.: 09:00)."
            if self.encaixe:
                erros["encaixe"] = "Encaixe é só para consultas."
        elif self.tipo == self.Tipo.CONSULTA:
            self.olho = ""
            self.tipo_cirurgia = ""
            self.precaucoes = ""

        if erros:
            raise ValidationError(erros)

        # As regras do dia só valem para quem vai ocupar vaga
        if not (self.data and self.tipo) or self.status not in self.STATUS_ATIVOS:
            return

        outros = self.ativos_do_dia()

        # 3) Um horário só pode ter um agendamento
        if self.horario and outros.filter(horario=self.horario).exists():
            raise ValidationError({"horario": "Já existe um agendamento neste dia e horário."})

        # 4) e 5) Mesmo dia com consulta e cirurgia, e limites diários
        problema = Agendamento.problema_no_dia(self.data, self.tipo, self.encaixe, excluir=self.pk)
        if problema:
            raise ValidationError(problema)

    @staticmethod
    def problema_no_dia(dia, tipo, encaixe=False, excluir=None):
        """Diz por que não dá para marcar mais um agendamento deste tipo no dia (ou None se dá).
        Usado na validação e na lista de horários livres."""
        outros = Agendamento.objects.filter(data=dia, status__in=Agendamento.STATUS_ATIVOS)
        if excluir:
            outros = outros.exclude(pk=excluir)

        # Nunca consulta e cirurgia no mesmo dia
        outro_tipo = Agendamento.Tipo.CIRURGIA if tipo == Agendamento.Tipo.CONSULTA else Agendamento.Tipo.CONSULTA
        if outros.filter(tipo=outro_tipo).exists():
            return (
                f"Este dia já tem {outro_tipo}s marcadas. "
                "Consulta e cirurgia não podem ficar no mesmo dia."
            )

        # Limites diários
        if tipo == Agendamento.Tipo.CIRURGIA:
            if outros.filter(tipo=tipo).count() >= LIMITE_CIRURGIAS:
                return f"Limite de {LIMITE_CIRURGIAS} cirurgias neste dia atingido."
        elif encaixe:
            if outros.filter(tipo=tipo, encaixe=True).count() >= LIMITE_ENCAIXES:
                return f"Limite de {LIMITE_ENCAIXES} encaixes neste dia atingido."
        elif outros.filter(tipo=tipo, encaixe=False).count() >= LIMITE_CONSULTAS:
            return (
                f"Limite de {LIMITE_CONSULTAS} consultas neste dia atingido. "
                "Ainda é possível marcar como encaixe."
            )
        return None


# ===== Consulta e Cirurgia: "visões" separadas da mesma tabela =====
# Um modelo proxy não cria tabela nova: ele usa a tabela de Agendamento,
# mas mostra só um tipo e preenche o campo "tipo" sozinho.

class ConsultaManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(tipo=Agendamento.Tipo.CONSULTA)


class CirurgiaManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(tipo=Agendamento.Tipo.CIRURGIA)


class Consulta(Agendamento):
    objects = ConsultaManager()

    class Meta:
        proxy = True
        verbose_name = "consulta"
        verbose_name_plural = "consultas"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tipo = Agendamento.Tipo.CONSULTA


class Cirurgia(Agendamento):
    objects = CirurgiaManager()

    class Meta:
        proxy = True
        verbose_name = "cirurgia"
        verbose_name_plural = "cirurgias"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tipo = Agendamento.Tipo.CIRURGIA
