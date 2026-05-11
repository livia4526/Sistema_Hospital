// ===== API.JS - GERENCIAMENTO DE REQUISIÇÕES =====

const API = {
    // Headers padrão
    headers: {
        'Content-Type': 'application/json'
    },
    
    // Requisição GET
    async get(endpoint) {
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: this.headers,
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API GET Error (${endpoint}):`, error);
            showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Requisição POST
    async post(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: this.headers,
                credentials: 'same-origin',
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Erro ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API POST Error (${endpoint}):`, error);
            showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Requisição PUT
    async put(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: this.headers,
                credentials: 'same-origin',
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Erro ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API PUT Error (${endpoint}):`, error);
            showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Requisição DELETE
    async delete(endpoint) {
        try {
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: this.headers,
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API DELETE Error (${endpoint}):`, error);
            showNotification(error.message, 'error');
            throw error;
        }
    }
};

// ===== FUNÇÕES ESPECÍFICAS DA API =====

// Pacientes
async function buscarPacientesAPI(termo) {
    return API.get(`/api/pacientes/buscar?q=${encodeURIComponent(termo)}`);
}

async function getPacienteAPI(id) {
    return API.get(`/api/pacientes/${id}`);
}

async function criarPacienteAPI(dados) {
    return API.post('/api/pacientes', dados);
}

async function atualizarPacienteAPI(id, dados) {
    return API.put(`/api/pacientes/${id}`, dados);
}

// Agendamentos
async function criarAgendamentoAPI(dados) {
    return API.post('/api/agendamentos', dados);
}

async function getAgendaDiaAPI(data) {
    return API.get(`/api/agenda/dia?data=${data}`);
}

async function marcarPresencaAPI(agendamentoId, presente) {
    return API.put(`/api/agenda/${agendamentoId}/presenca`, { presente });
}

async function salvarObservacaoAPI(agendamentoId, observacao) {
    return API.put(`/api/agenda/${agendamentoId}/observacao`, { observacao });
}

async function getHorariosDisponiveisAPI(data, tipo) {
    return API.get(`/api/horarios_disponiveis?data=${data}&tipo=${tipo}`);
}

// Dashboard
async function getEstatisticasHojeAPI() {
    return API.get('/api/estatisticas/hoje');
}

async function getMetasAPI() {
    return API.get('/api/metas');
}

async function getAlertasAPI() {
    return API.get('/api/alertas');
}

async function getCalendarioSemanalAPI(offset = 0) {
    return API.get(`/api/calendario/semanal?offset=${offset}`);
}

async function getDiasComCirurgiaAPI(mes, ano) {
    return API.get(`/api/dias_com_cirurgia?mes=${mes}&ano=${ano}`);
}

// Autenticação
async function fazerLoginAPI(username, password) {
    return API.post('/api/login', { username, password });
}

async function fazerLogoutAPI() {
    return API.post('/api/logout', {});
}

async function verificarSessaoAPI() {
    return API.get('/api/verificar_sessao');
}