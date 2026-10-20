from rest_framework import serializers

from .models import Paciente


class PacienteSerializer(serializers.ModelSerializer):
    # Campos calculados: só aparecem na resposta, ninguém envia
    idade = serializers.IntegerField(read_only=True)
    plano_nome = serializers.CharField(source="get_plano_display", read_only=True)

    class Meta:
        model = Paciente
        fields = [
            "id", "nome", "cpf", "data_nascimento", "idade", "sexo",
            "plano", "plano_nome", "plano_outro", "celular", "email",
            "informacoes_complementares", "criado_em",
        ]
        read_only_fields = ["criado_em"]

    def validate(self, dados):
        # Reaproveita as regras do clean() do modelo
        # (plano "Outros" exige o nome do plano; nascimento não pode ser no futuro)
        paciente = self.instance or Paciente()
        for campo, valor in dados.items():
            setattr(paciente, campo, valor)
        paciente.clean()
        dados["plano_outro"] = paciente.plano_outro
        return dados