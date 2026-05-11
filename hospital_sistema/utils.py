import re
from datetime import datetime, timedelta
import requests
import json

def validar_cpf(cpf):
    """Valida se o CPF tem 11 dígitos"""
    cpf = re.sub(r'\D', '', cpf)
    return len(cpf) == 11

def validar_email(email):
    """Valida formato do email"""
    padrao = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(padrao, email) is not None

def validar_telefone(telefone):
    """Valida se telefone tem formato válido"""
    telefone = re.sub(r'\D', '', telefone)
    return len(telefone) >= 10 and len(telefone) <= 11

def calcular_idade(data_nascimento):
    """Calcula idade a partir da data de nascimento"""
    hoje = datetime.now()
    nascimento = datetime.strptime(data_nascimento, '%Y-%m-%d')
    idade = hoje.year - nascimento.year
    if hoje.month < nascimento.month or (hoje.month == nascimento.month and hoje.day < nascimento.day):
        idade -= 1
    return idade

def gerar_horarios_disponiveis(data, ocupados):
    """Gera lista de horários disponíveis entre 08:00 e 18:00"""
    horarios = []
    for hora in range(8, 19):
        for minuto in [0, 30]:
            horario = f"{hora:02d}:{minuto:02d}"
            if horario not in ocupados:
                horarios.append(horario)
    return horarios

def calcular_status_dia(total_consultas, limite_consultas=20, limite_encaixes=5):
    """Calcula status do dia baseado na ocupação"""
    total_maximo = limite_consultas + limite_encaixes
    percentual = (total_consultas / total_maximo) * 100
    
    if percentual <= 50:
        return {'status': 'tranquilo', 'cor': 'green', 'percentual': percentual}
    elif percentual <= 80:
        return {'status': 'moderado', 'cor': 'yellow', 'percentual': percentual}
    else:
        return {'status': 'cheio', 'cor': 'red', 'percentual': percentual}

def enviar_whatsapp(numero, mensagem):
    """Simula envio de mensagem via WhatsApp (integração real pode ser feita com Twilio ou API oficial)"""
    # Por enquanto, apenas registra no console
    print(f"[WHATSAPP] Para: {numero} - Mensagem: {mensagem}")
    # Aqui você pode integrar com Twilio ou WhatsApp Business API
    return True

def enviar_email(destinatario, assunto, mensagem):
    """Simula envio de email"""
    print(f"[EMAIL] Para: {destinatario} - Assunto: {assunto} - Mensagem: {mensagem}")
    return True

def agendar_notificacoes(paciente, consulta):
    """Agenda notificações para a consulta (5 dias antes, 1 dia antes, no dia)"""
    data_consulta = datetime.strptime(consulta['data'], '%Y-%m-%d')
    data_atual = datetime.now()
    
    # 5 dias antes
    data_5dias = data_consulta - timedelta(days=5)
    if data_5dias > data_atual:
        agendar_mensagem(paciente, consulta, data_5dias, "5 dias antes")
    
    # 1 dia antes
    data_1dia = data_consulta - timedelta(days=1)
    if data_1dia > data_atual:
        agendar_mensagem(paciente, consulta, data_1dia, "1 dia antes", solicitar_confirmacao=True)
    
    # No dia da consulta
    agendar_mensagem(paciente, consulta, data_consulta, "no dia")

def agendar_mensagem(paciente, consulta, data_envio, tipo, solicitar_confirmacao=False):
    """Prepara e agenda a mensagem"""
    mensagem = f"Olá {paciente['nome']}! Lembrando da sua {consulta['tipo']} agendada para {consulta['data']} às {consulta['horario']}."
    
    if solicitar_confirmacao:
        mensagem += "\n\nResponda com SIM para confirmar ou NAO para cancelar."
    
    # Aqui você implementaria o agendamento real (ex: com Celery, cron job, etc.)
    print(f"[AGENDADO] {tipo}: {mensagem}")