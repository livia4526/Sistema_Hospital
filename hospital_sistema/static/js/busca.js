// ===== BUSCA.JS - PESQUISA DE PACIENTES =====

function buscarPacientes() {
    const termo = document.getElementById('searchInput').value;
    if (!termo || termo.length < 2) {
        showNotification('Digite pelo menos 2 caracteres para buscar', 'warning');
        return;
    }
    
    showLoading();
    
    fetch(`/api/pacientes/buscar?q=${encodeURIComponent(termo)}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.pacientes.length === 0) {
                showNotification('Nenhum paciente encontrado', 'warning');
                document.getElementById('buscaResultados').innerHTML = '<div class="text-center">Nenhum paciente encontrado</div>';
                return;
            }
            
            renderizarResultadosBusca(data.pacientes);
        })
        .catch(error => {
            hideLoading();
            console.error('Erro na busca:', error);
            showNotification('Erro ao buscar pacientes', 'error');
        });
}

function renderizarResultadosBusca(pacientes) {
    const container = document.getElementById('buscaResultados');
    if (!container) return;
    
    container.innerHTML = pacientes.map(paciente => `
        <div class="resultado-card" onclick="selecionarPaciente(${paciente.id})">
            <div class="resultado-nome">👤 ${paciente.nome}</div>
            <div class="resultado-info">
                <span>📄 CPF: ${paciente.cpf}</span>
                <span>📞 ${paciente.telefone}</span>
            </div>
            <div class="resultado-info">
                <span>🏥 ${paciente.plano || 'Sem plano'}</span>
                <span>🎂 ${paciente.idade} anos</span>
            </div>
            <div class="resultado-stats">
                <div class="resultado-stat">🩺 ${paciente.total_consultas} consultas</div>
                <div class="resultado-stat">🔪 ${paciente.total_cirurgias} cirurgias</div>
                <div class="resultado-stat">📅 Última: ${paciente.ultima_consulta || 'N/A'}</div>
            </div>
            <div class="bolinhas">
                ${paciente.tem_consulta_agendada ? '<div class="bolinha bolinha-amarela" title="Consulta agendada"></div>' : ''}
                ${paciente.total_faltas > 0 ? '<div class="bolinha bolinha-vermelha" title="Paciente faltou"></div>' : ''}
                ${paciente.total_consultas > 0 ? '<div class="bolinha bolinha-verde" title="Consultas realizadas"></div>' : ''}
            </div>
        </div>
    `).join('');
    
    // Mostrar container de resultados
    container.classList.remove('hidden');
}

function selecionarPaciente(pacienteId) {
    pacienteSelecionado = pacienteId;
    
    fetch(`/api/pacientes/${pacienteId}`)
        .then(response => response.json())
        .then(paciente => {
            // Verificar de onde veio a chamada (edição ou agendamento)
            const urlParams = new URLSearchParams(window.location.search);
            const origem = urlParams.get('origem') || sessionStorage.getItem('origemAgendamento');
            
            if (origem === 'agendamento') {
                // Redirecionar para agendamento com dados pré-preenchidos
                sessionStorage.setItem('pacienteAgendamento', JSON.stringify(paciente));
                window.location.href = `/agendamento?paciente_id=${pacienteId}`;
            } else {
                // Abrir detalhes do paciente
                abrirDetalhesPaciente(paciente);
            }
        });
}

function abrirDetalhesPaciente(paciente) {
    const modal = document.getElementById('modalDetalhesPaciente');
    const container = document.getElementById('detalhesPacienteContainer');
    
    container.innerHTML = `
        <div class="card">
            <h3 style="color: var(--primary-blue);">${paciente.nome}</h3>
            
            <div class="row" style="margin-top: 20px;">
                <div>
                    <p><strong>📄 CPF:</strong> ${paciente.cpf}</p>
                    <p><strong>📅 Data Nasc.:</strong> ${formatarData(paciente.data_nascimento)}</p>
                    <p><strong>🎂 Idade:</strong> ${paciente.idade} anos</p>
                    <p><strong>⚧ Sexo:</strong> ${paciente.sexo || 'Não informado'}</p>
                </div>
                <div>
                    <p><strong>📞 Telefone:</strong> ${paciente.telefone}</p>
                    <p><strong>📧 Email:</strong> ${paciente.email || 'Não informado'}</p>
                    <p><strong>🏥 Plano:</strong> ${paciente.plano || 'Não informado'}</p>
                    <p><strong>📍 Endereço:</strong> ${paciente.endereco || 'Não informado'}</p>
                </div>
            </div>
            
            ${paciente.info_complementares ? `
                <div style="margin-top: 20px; padding: 15px; background: var(--gray-light); border-radius: var(--border-radius-small);">
                    <strong>📋 Informações Complementares:</strong><br>
                    ${paciente.info_complementares}
                </div>
            ` : ''}
            
            <div style="margin-top: 20px;">
                <h4>📊 Histórico</h4>
                <div class="row-3" style="margin-top: 10px;">
                    <div class="stat-card">
                        <div class="stat-number">${paciente.total_consultas}</div>
                        <div class="stat-label">Consultas realizadas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${paciente.total_cirurgias}</div>
                        <div class="stat-label">Cirurgias realizadas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${paciente.total_faltas}</div>
                        <div class="stat-label">Faltas</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="fecharModal('modalDetalhesPaciente')">Fechar</button>
                <button class="btn btn-primary" onclick="editarPaciente(${paciente.id})">✏️ Editar</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function editarPaciente(pacienteId) {
    fecharModal('modalDetalhesPaciente');
    window.location.href = `/paciente/editar/${pacienteId}`;
}