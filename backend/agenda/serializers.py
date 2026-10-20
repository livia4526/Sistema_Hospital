from rest_framework import serializers

from .models import Agendamento


class AgendamentoSerializer(serializers.ModelSerializer):
    # Nomes "bonitos" para o React mostrar na tela (só leitura)
    paciente_nome = serializers.CharField(source="paciente.nome", read_only=True)
    tipo_nome = serializers.CharField(source="get_tipo_display", read_only=True)
    status_nome = serializers.CharField(source="get_status_display", read_only=True)
    horario = serializers.TimeField(format="%H:%M")  # sem segundos

    class Meta:
        model = Agendamento
        fields = [
            "id", "paciente", "paciente_nome", "tipo", "tipo_nome", "data", "horario",
            "status", "status_nome", "encaixe", "motivo",
            "olho", "tipo_cirurgia", "precaucoes", "observacao",
            "remarcado_de", "criado_em",
        ]
        read_only_fields = ["criado_em", "remarcado_de"]

    def validate(self, dados):
        if self.instance is None:
            # Todo agendamento novo começa como "Agendada"
            dados["status"] = Agendamento.Status.AGENDADA
        # Reaproveita as regras do clean() do modelo (limites, horário, mesmo dia...)
        agendamento = self.instance or Agendamento()
        for campo, valor in dados.items():
            setattr(agendamento, campo, valor)
        agendamento.clean()
        return dados