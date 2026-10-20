from django.contrib import admin
 
from .models import Paciente
 
 
@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ["nome", "cpf", "celular", "plano", "idade"]
    search_fields = ["nome", "cpf"]
    list_filter = ["plano", "sexo"]

