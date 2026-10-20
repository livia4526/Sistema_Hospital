from django import forms
from django.contrib import admin
from django.db import models

from .models import Cirurgia, Consulta

# Campos de data e hora com o seletor do próprio navegador:
# hora e minuto, sem segundos, só dentro do expediente.
CAMPO_DATA = forms.DateInput(format="%Y-%m-%d", attrs={"type": "date"})


def campo_hora(passo_em_segundos):
    return forms.TimeInput(
        format="%H:%M",
        attrs={"type": "time", "min": "08:00", "max": "18:00", "step": passo_em_segundos},
    )


class BaseAgendaAdmin(admin.ModelAdmin):
    list_display = ["data", "horario", "paciente", "status"]
    list_filter = ["status", "data"]
    search_fields = ["paciente__nome", "paciente__cpf"]
    date_hierarchy = "data"
    autocomplete_fields = ["paciente"]
    formfield_overrides = {models.DateField: {"widget": CAMPO_DATA}}
    passo_do_horario = 60  # de minuto em minuto

    campos_ao_marcar = []  # cada tela define os seus

    def get_fields(self, request, obj=None):
        # Marcando (obj é None): sem status, ele começa como "Agendada".
        # Editando um agendamento que já existe: o status aparece.
        if obj is None:
            return self.campos_ao_marcar
        return self.campos_ao_marcar + ["status"]

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == "horario":
            kwargs["widget"] = campo_hora(self.passo_do_horario)
        return super().formfield_for_dbfield(db_field, request, **kwargs)


@admin.register(Consulta)
class ConsultaAdmin(BaseAgendaAdmin):
    list_display = BaseAgendaAdmin.list_display + ["encaixe"]
    list_filter = BaseAgendaAdmin.list_filter + ["encaixe"]
    campos_ao_marcar = ["paciente", "data", "horario", "encaixe", "motivo", "observacao"]


@admin.register(Cirurgia)
class CirurgiaAdmin(BaseAgendaAdmin):
    list_display = BaseAgendaAdmin.list_display + ["olho", "tipo_cirurgia"]
    list_filter = BaseAgendaAdmin.list_filter + ["tipo_cirurgia"]
    campos_ao_marcar = ["paciente", "data", "horario", "olho", "tipo_cirurgia", "precaucoes", "observacao"]
    passo_do_horario = 3600  # só horas cheias