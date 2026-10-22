from django.contrib import admin

from .models import MetaMensal


@admin.register(MetaMensal)
class MetaMensalAdmin(admin.ModelAdmin):
    list_display = ["__str__", "meta_consultas", "meta_cirurgias"]
