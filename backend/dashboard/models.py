from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

# Valores usados quando ainda não existe nenhuma meta cadastrada
META_CONSULTAS_PADRAO = 200
META_CIRURGIAS_PADRAO = 50


class MetaMensal(models.Model):
    """Metas de um mês. Os valores são configuráveis pelo /admin."""

    ano = models.PositiveIntegerField("ano")
    mes = models.PositiveSmallIntegerField(
        "mês", validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    meta_consultas = models.PositiveIntegerField("meta de consultas", default=META_CONSULTAS_PADRAO)
    meta_cirurgias = models.PositiveIntegerField("meta de cirurgias", default=META_CIRURGIAS_PADRAO)

    class Meta:
        verbose_name = "meta do mês"
        verbose_name_plural = "metas do mês"
        ordering = ["-ano", "-mes"]
        constraints = [
            models.UniqueConstraint(fields=["ano", "mes"], name="uma_meta_por_mes"),
        ]

    def __str__(self):
        return f"Metas de {self.mes:02d}/{self.ano}"

    @classmethod
    def do_mes(cls, ano, mes):
        """Busca a meta do mês. Se não existir, cria copiando os alvos do mês anterior."""
        meta = cls.objects.filter(ano=ano, mes=mes).first()
        if meta:
            return meta
        anterior = cls.objects.filter(models.Q(ano__lt=ano) | models.Q(ano=ano, mes__lt=mes)).first()
        return cls.objects.create(
            ano=ano,
            mes=mes,
            meta_consultas=anterior.meta_consultas if anterior else META_CONSULTAS_PADRAO,
            meta_cirurgias=anterior.meta_cirurgias if anterior else META_CIRURGIAS_PADRAO,
        )
