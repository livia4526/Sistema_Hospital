// ===== DASHBOARD.JS - GERENCIAMENTO DO PAINEL PRINCIPAL =====

function carregarDashboard() {
    carregarEstatisticasHoje();
    carregarMetas();
    carregarAlertas();
    carregarAgendaDoDia();
    carregarCalendarioSemanal();
}

function carregarEstatisticasHoje() {
    fetch('/api/estatisticas/hoje')
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalPacientes').innerText = data.total_pacientes || 0;
            document.getElementById('compareceram').innerText = data.compareceram || 0;
            document.getElementById('faltaram').innerText = data.faltaram || 0;
            document.getElementById('pendentes').innerText = data.pendentes || 0;
        })
        .catch(error => console.error('Erro ao carregar estatísticas:', error));
}

function carregarMetas() {
    fetch('/api/metas')
        .then(response => response.json())
        .then(data => {
            // Consultas
            const consultasPercent = (data.consultas.alcancado / data.consultas.meta) * 100;
            document.getElementById('metaConsultasTexto').innerText = `${data.consultas.alcancado}/${data.consultas.meta} Consultas realizadas`;
            document.getElementById('metaConsultasBarra').style.width = `${consultasPercent}%`;
            
            // Cirurgias
            const cirurgiasPercent = (data.cirurgias.alcancado / data.cirurgias.meta) * 100;
            document.getElementById('metaCirurgiasTexto').innerText = `${data.cirurgias.alcancado}/${data.cirurgias.meta} Cirurgias realizadas`;
            document.getElementById('metaCirurgiasBarra').style.width = `${cirurgiasPercent}%`;
            
            // Satisfação
            document.getElementById('metaSatisfacaoTexto').innerText = `${data.satisfacao.alcancado}% Satisfação`;
            document.getElementById('metaSatisfacaoBarra').style.width = `${data.satisfacao.alcancado}%`;
        })
        .catch(error => console.error('Erro ao carregar metas:', error));
}

function carregarAlertas() {
    fetch('/api/alertas')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('alertasContainer');
            if (!container) return;
            
            if (data.alertas.length === 0) {
                container.innerHTML = '<div class="alerta-item alerta-info">✅ Nenhum alerta no momento</div>';
                return;
            }
            
            container.innerHTML = data.alertas.map(alerta => `
                <div class="alerta-item alerta-${alerta.tipo}">
                    <span>${alerta.icone || '⚠️'}</span>
                    <span>${alerta.mensagem}</span>
                </div>
            `).join('');
        })
        .catch(error => console.error('Erro ao carregar alertas:', error));
}

function carregarAgendaDoDia(filtro = 'hoje') {
    let data = new Date().toISOString().split('T')[0];
    
    if (filtro === 'amanha') {
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        data = amanha.toISOString().split('T')[0];
    }
    
    fetch(`/api/agenda/dia?data=${data}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('agendaTabelaBody');
            if (!container) return;
            
            const isHoje = filtro === 'hoje';
            
            if (data.agenda.length === 0) {
                container.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum agendamento para este dia</td></tr>';
                return;
            }
            
            container.innerHTML = data.agenda.map(item => `
                <tr class="${item.is_encaixe ? 'encaixe-row' : ''}">
                    <td>${item.paciente_nome}</td>
                    <td>${item.horario}</td>
                    <td><span class="badge badge-${item.tipo === 'consulta' ? 'blue' : 'yellow'}">${item.tipo === 'consulta' ? 'Consulta' : 'Cirurgia'}</span></td>
                    ${isHoje ? `
                        <td>
                            <button class="presente-btn ${item.status === 'realizada' ? 'marcado' : ''}" 
                                    onclick="marcarPresenca(${item.id}, this)">
                                ${item.status === 'realizada' ? '✅' : '○'}
                            </button>
                        </td>
                        <td>
                            <button class="obs-btn" onclick="abrirModalObservacao(${item.id})" title="Adicionar observação">
                                📝
                            </button>
                        </td>
                    ` : `
                        <td colspan="2" style="color: var(--gray-dark);">Apenas visualização</td>
                    `}
                </tr>
            `).join('');
            
            // Atualizar título da agenda
            const tituloAgenda = document.getElementById('agendaTitulo');
            if (tituloAgenda) {
                const dataFormatada = formatarData(data.data);
                tituloAgenda.innerHTML = `Agenda do dia ${dataFormatada} ${filtro === 'hoje' ? '(Hoje)' : '(Amanhã)'}`;
            }
        })
        .catch(error => console.error('Erro ao carregar agenda:', error));
}

function marcarPresenca(agendamentoId, button) {
    const isMarcado = button.classList.contains('marcado');
    const novoStatus = !isMarcado;
    
    fetch(`/api/agenda/${agendamentoId}/presenca`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presente: novoStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (novoStatus) {
                button.classList.add('marcado');
                button.innerHTML = '✅';
                showNotification('Presença registrada com sucesso!');
            } else {
                button.classList.remove('marcado');
                button.innerHTML = '○';
                showNotification('Presença desmarcada');
            }
            carregarEstatisticasHoje();
            carregarCalendarioSemanal();
        }
    })
    .catch(error => console.error('Erro ao marcar presença:', error));
}

function abrirModalObservacao(agendamentoId) {
    fetch(`/api/agenda/${agendamentoId}/observacao`)
        .then(response => response.json())
        .then(data => {
            const modal = document.getElementById('modalObservacao');
            const textarea = document.getElementById('obsTextarea');
            const salvarBtn = document.getElementById('salvarObservacao');
            
            textarea.value = data.observacao || '';
            salvarBtn.onclick = () => salvarObservacao(agendamentoId, textarea.value);
            
            modal.style.display = 'flex';
        });
}

function salvarObservacao(agendamentoId, observacao) {
    fetch(`/api/agenda/${agendamentoId}/observacao`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observacao: observacao })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Observação salva com sucesso!');
            fecharModal('modalObservacao');
        }
    });
}

function carregarCalendarioSemanal(semanaOffset = 0) {
    fetch(`/api/calendario/semanal?offset=${semanaOffset}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('semanaGrid');
            if (!container) return;
            
            container.innerHTML = data.dias.map(dia => `
                <div class="dia-card">
                    <div class="dia-nome">${dia.nome}</div>
                    <div class="dia-data">${dia.data_formatada}</div>
                    <div class="dia-status status-${dia.status}">${dia.status_texto}</div>
                    <div class="dia-percentual">${dia.percentual}%</div>
                    <div class="dia-consultas">📋 ${dia.total_consultas} consultas</div>
                    <div class="dia-cirurgias">🔪 ${dia.total_cirurgias} cirurgias</div>
                    ${dia.vagas_encaixe > 0 ? `<div class="dia-encaixe">⚡ ${dia.vagas_encaixe} encaixes disponíveis</div>` : ''}
                </div>
            `).join('');
            
            // Atualizar título da semana
            const semanaTitulo = document.getElementById('semanaTitulo');
            if (semanaTitulo) {
                semanaTitulo.innerText = `Semana: ${data.semana_titulo}`;
            }
        });
}

function mudarSemana(delta) {
    let offset = parseInt(sessionStorage.getItem('semanaOffset') || '0');
    offset += delta;
    sessionStorage.setItem('semanaOffset', offset);
    carregarCalendarioSemanal(offset);
}

function filtrarAgenda(filtro) {
    // Atualizar botões ativos
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    carregarAgendaDoDia(filtro);
}