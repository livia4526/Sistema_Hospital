// ===== MAIN.JS - INICIALIZAÇÃO DO SISTEMA =====

// Variáveis globais
let token = null;
let usuarioAtual = null;
let pacienteSelecionado = null;

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema HOS inicializado');
    
    // Verificar se usuário está logado (via session)
    verificarSessao();
    
    // Configurar máscaras de input
    configurarMascaras();
    
    // Configurar eventos globais
    configurarEventosGlobais();
});

function verificarSessao() {
    fetch('/api/verificar_sessao')
        .then(response => response.json())
        .then(data => {
            if (data.logado) {
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('mainSystem').classList.remove('hidden');
                document.getElementById('currentUser').innerText = data.usuario;
                carregarDashboard();
            } else {
                document.getElementById('loginScreen').classList.remove('hidden');
                document.getElementById('mainSystem').classList.add('hidden');
            }
        });
}

function configurarMascaras() {
    // Máscara para CPF
    const cpfInputs = document.querySelectorAll('.cpf-input');
    cpfInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            }
        });
    });
    
    // Máscara para telefone
    const telefoneInputs = document.querySelectorAll('.telefone-input');
    telefoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length === 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length === 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
            e.target.value = value;
        });
    });
}

function configurarEventosGlobais() {
    // Fechar modais ao clicar fora
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };
    
    // Tecla Enter para busca
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const buscaInput = document.getElementById('searchInput');
            if (buscaInput && document.activeElement === buscaInput) {
                buscarPacientes();
            }
        }
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function formatarData(data) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarDataBr(data) {
    if (!data) return '';
    return data.split('-').reverse().join('/');
}

function formatarDataParaInput(data) {
    if (!data) return '';
    return data.split('/').reverse().join('-');
}

// Função para abrir/fechar modais
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Loading overlay
function showLoading() {
    let loading = document.getElementById('loadingOverlay');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        loading.innerHTML = '<div class="loading" style="width: 50px; height: 50px;"></div>';
        document.body.appendChild(loading);
    }
    loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.style.display = 'none';
    }
}