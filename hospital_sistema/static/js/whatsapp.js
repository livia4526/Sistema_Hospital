// ===== WHATSAPP.JS - INTEGRAÇÃO COM WHATSAPP =====

// Configurações
const WHATSAPP_CONFIG = {
    // Número da clínica (para receber respostas)
    clinicaNumero: '557999999999', // Formato: código país + código área + número
    // Mensagem padrão de lembrete
    mensagemLembrete: (paciente, agendamento) => {
        const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR');
        const tipo = agendamento.tipo === 'consulta' ? 'consulta' : 'cirurgia';
        return `Olá ${paciente.nome}! 🌟\n\n` +
               `Lembrando da sua ${tipo} agendada para o dia ${dataFormatada} às ${agendamento.horario}.\n\n` +
               `📍 Local: HOS - Hospital de Olhos de Sergipe\n` +
               `📞 Dúvidas? Ligue (79) 99999-9999\n\n` +
               `Confirme sua presença respondendo:\n` +
               `1️⃣ - Confirmar presença\n` +
               `2️⃣ - Remarcar\n` +
               `3️⃣ - Cancelar`;
    },
    
    // Mensagem de confirmação
    mensagemConfirmacao: (paciente, agendamento) => {
        return `✅ Presença confirmada, ${paciente.nome}!\n\n` +
               `Sua ${agendamento.tipo} será no dia ${new Date(agendamento.data).toLocaleDateString('pt-BR')} às ${agendamento.horario}.\n\n` +
               `⚠️ Lembre-se de chegar com 15 minutos de antecedência.`;
    },
    
    // Mensagem de remarcação
    mensagemRemarcacao: (paciente) => {
        return `🔄 Olá ${paciente.nome}! Entraremos em contato para remarcar seu horário.\n\n` +
               `Por favor, aguarde o retorno da nossa equipe.`;
    },
    
    // Mensagem de cancelamento
    mensagemCancelamento: (paciente) => {
        return `❌ Cancelamento confirmado, ${paciente.nome}!\n\n` +
               `Seu horário foi liberado na agenda.\n\n` +
               `Qualquer dúvida, estamos à disposição.`;
    }
};

// Enviar mensagem via WhatsApp
async function enviarWhatsApp(numero, mensagem) {
    // Formatar número (remover caracteres não numéricos)
    const numeroLimpo = numero.replace(/\D/g, '');
    
    // Verificar se número é válido
    if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
        console.error('Número inválido:', numero);
        return false;
    }
    
    // Adicionar código do Brasil (55) se não tiver
    let numeroCompleto = numeroLimpo;
    if (!numeroLimpo.startsWith('55')) {
        numeroCompleto = '55' + numeroLimpo;
    }
    
    // URL do WhatsApp Web
    const url = `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensagem)}`;
    
    // Abrir WhatsApp em nova aba (simulação)
    // Em produção real, usaria API oficial do WhatsApp Business ou Twilio
    console.log(`[WhatsApp] Enviando para ${numeroCompleto}: ${mensagem}`);
    
    // Simular envio (em produção, chamar API real)
    try {
        // Aqui você implementaria a chamada real para a API do WhatsApp
        // Exemplo com Twilio:
        // await fetch('/api/whatsapp/enviar', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ numero: numeroCompleto, mensagem })
        // });
        
        return true;
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return false;
    }
}

// Enviar lembrete de consulta
async function enviarLembreteConsulta(paciente, agendamento) {
    const mensagem = WHATSAPP_CONFIG.mensagemLembrete(paciente, agendamento);
    return enviarWhatsApp(paciente.telefone, mensagem);
}

// Enviar confirmação
async function enviarConfirmacao(paciente, agendamento) {
    const mensagem = WHATSAPP_CONFIG.mensagemConfirmacao(paciente, agendamento);
    return enviarWhatsApp(paciente.telefone, mensagem);
}

// Processar resposta do paciente (simulada)
function processarRespostaWhatsApp(mensagem, pacienteId, agendamentoId) {
    // Simular recebimento de resposta do WhatsApp
    const resposta = mensagem.trim().toLowerCase();
    
    if (resposta === '1' || resposta === 'confirmar' || resposta === 'sim') {
        // Confirmar presença
        confirmarPresenca(pacienteId, agendamentoId);
        return "✅ Presença confirmada!";
        
    } else if (resposta === '2' || resposta === 'remarcar') {
        // Remarcar
        solicitarRemarcacao(pacienteId, agendamentoId);
        return "🔄 Solicitação de remarcação registrada. Em breve entraremos em contato.";
        
    } else if (resposta === '3' || resposta === 'cancelar' || resposta === 'nao') {
        // Cancelar
        cancelarAgendamento(pacienteId, agendamentoId);
        return "❌ Agendamento cancelado com sucesso.";
        
    } else {
        return "❓ Resposta não reconhecida. Por favor, responda 1 para confirmar, 2 para remarcar ou 3 para cancelar.";
    }
}

// Confirmar presença via WhatsApp
async function confirmarPresenca(pacienteId, agendamentoId) {
    try {
        // Atualizar status no sistema
        await marcarPresencaAPI(agendamentoId, true);
        
        // Buscar dados do paciente e agendamento
        const paciente = await getPacienteAPI(pacienteId);
        const agenda = await getAgendaDiaAPI(new Date().toISOString().split('T')[0]);
        const agendamento = agenda.agenda.find(a => a.id === agendamentoId);
        
        // Enviar mensagem de confirmação
        if (agendamento) {
            await enviarConfirmacao(paciente, agendamento);
        }
        
        showNotification(`Presença de ${paciente.nome} confirmada via WhatsApp!`, 'success');
        
    } catch (error) {
        console.error('Erro ao confirmar presença:', error);
        showNotification('Erro ao processar confirmação', 'error');
    }
}

// Solicitar remarcação
async function solicitarRemarcacao(pacienteId, agendamentoId) {
    try {
        // Buscar dados do paciente
        const paciente = await getPacienteAPI(pacienteId);
        
        // Enviar mensagem informando que vão entrar em contato
        const mensagem = WHATSAPP_CONFIG.mensagemRemarcacao(paciente);
        await enviarWhatsApp(paciente.telefone, mensagem);
        
        // Criar alerta para secretária
        showNotification(`Paciente ${paciente.nome} solicitou remarcação. Verifique!`, 'warning');
        
    } catch (error) {
        console.error('Erro ao processar remarcação:', error);
    }
}

// Cancelar agendamento
async function cancelarAgendamento(pacienteId, agendamentoId) {
    try {
        // Buscar dados do paciente
        const paciente = await getPacienteAPI(pacienteId);
        
        // Enviar mensagem de cancelamento
        const mensagem = WHATSAPP_CONFIG.mensagemCancelamento(paciente);
        await enviarWhatsApp(paciente.telefone, mensagem);
        
        // Atualizar status no sistema (opcional: cancelar realmente)
        showNotification(`Agendamento de ${paciente.nome} foi cancelado via WhatsApp`, 'info');
        
    } catch (error) {
        console.error('Erro ao processar cancelamento:', error);
    }
}

// Enviar lembretes automáticos (rodar todos os dias)
async function enviarLembretesAutomaticos() {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataAmanha = amanha.toISOString().split('T')[0];
    
    try {
        const agenda = await getAgendaDiaAPI(dataAmanha);
        
        for (const item of agenda.agenda) {
            // Verificar se já foi enviado lembrete
            const lembreteEnviado = localStorage.getItem(`lembrete_${item.id}`);
            if (!lembreteEnviado) {
                const paciente = await getPacienteAPI(item.paciente_id);
                
                // Enviar lembrete
                await enviarLembreteConsulta(paciente, item);
                
                // Marcar como enviado
                localStorage.setItem(`lembrete_${item.id}`, new Date().toISOString());
                
                // Pequeno delay entre mensagens
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log('Lembretes automáticos enviados com sucesso!');
        
    } catch (error) {
        console.error('Erro ao enviar lembretes automáticos:', error);
    }
}

// Iniciar sistema de lembretes automáticos
function iniciarLembretesAutomaticos() {
    // Verificar a cada hora se precisa enviar lembretes
    setInterval(() => {
        const horaAtual = new Date().getHours();
        // Enviar lembretes às 9h da manhã
        if (horaAtual === 9) {
            enviarLembretesAutomaticos();
        }
    }, 3600000); // 1 hora
    
    console.log('Sistema de lembretes automáticos iniciado');
}

// Exportar funções para uso global
window.enviarWhatsApp = enviarWhatsApp;
window.enviarLembreteConsulta = enviarLembreteConsulta;
window.processarRespostaWhatsApp = processarRespostaWhatsApp;
window.iniciarLembretesAutomaticos = iniciarLembretesAutomaticos;

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    // iniciarLembretesAutomaticos(); // Descomentar para ativar
    console.log('WhatsApp integration ready');
});