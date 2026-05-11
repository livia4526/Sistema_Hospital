// ===== CALENDAR.JS - DATE PICKER E HORÁRIOS =====

let dataSelecionada = null;
let horarioSelecionado = null;

function configurarDatePicker(inputId, onSelectCallback) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Criar container do date picker
    const pickerContainer = document.createElement('div');
    pickerContainer.className = 'date-picker';
    pickerContainer.style.display = 'none';
    pickerContainer.style.position = 'absolute';
    pickerContainer.style.zIndex = '1000';
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(pickerContainer);
    
    let currentDate = new Date();
    
    function renderDatePicker() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        
        // Buscar dias com cirurgia
        fetch(`/api/dias_com_cirurgia?mes=${month+1}&ano=${year}`)
            .then(response => response.json())
            .then(diasComCirurgia => {
                let html = `
                    <div class="date-picker-header">
                        <div class="date-picker-year">${year}</div>
                        <div class="date-picker-month">${currentDate.toLocaleString('pt-BR', { month: 'long' })}</div>
                    </div>
                    <div class="date-picker-nav">
                        <button onclick="mudarMesDatePicker(-1)">◀</button>
                        <button onclick="mudarMesDatePicker(1)">▶</button>
                    </div>
                    <div class="date-picker-weekdays">
                        <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                    </div>
                    <div class="date-picker-days">
                `;
                
                // Dias vazios
                for (let i = 0; i < startDay; i++) {
                    html += `<div class="date-picker-day disabled"></div>`;
                }
                
                // Dias do mês
                for (let d = 1; d <= lastDay.getDate(); d++) {
                    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    const hasCirurgia = diasComCirurgia.includes(dateStr);
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    const isSelected = dateStr === dataSelecionada;
                    
                    html += `
                        <div class="date-picker-day ${isSelected ? 'selected' : ''} ${hasCirurgia ? 'tem-cirurgia' : ''}"
                             onclick="selecionarData('${dateStr}', '${inputId}')">
                            ${d}
                        </div>
                    `;
                }
                
                html += `</div>`;
                pickerContainer.innerHTML = html;
            });
    }
    
    // Mostrar/esconder date picker
    input.addEventListener('focus', () => {
        renderDatePicker();
        pickerContainer.style.display = 'block';
    });
    
    document.addEventListener('click', (e) => {
        if (!pickerContainer.contains(e.target) && e.target !== input) {
            pickerContainer.style.display = 'none';
        }
    });
    
    window.mudarMesDatePicker = (delta) => {
        currentDate.setMonth(currentDate.getMonth() + delta);
        renderDatePicker();
    };
    
    window.selecionarData = (date, inputId) => {
        dataSelecionada = date;
        const input = document.getElementById(inputId);
        if (input) {
            input.value = formatarDataBr(date);
        }
        pickerContainer.style.display = 'none';
        
        // Carregar horários disponíveis para esta data
        carregarHorariosDisponiveis(date);
        
        if (onSelectCallback) onSelectCallback(date);
    };
}

function carregarHorariosDisponiveis(data) {
    const horariosContainer = document.getElementById('horariosList');
    if (!horariosContainer) return;
    
    fetch(`/api/horarios_disponiveis?data=${data}`)
        .then(response => response.json())
        .then(data => {
            if (data.horarios.length === 0) {
                horariosContainer.innerHTML = '<div class="horario-item disabled">Nenhum horário disponível neste dia</div>';
                return;
            }
            
            horariosContainer.innerHTML = data.horarios.map(horario => `
                <div class="horario-item" onclick="selecionarHorario('${horario}')">
                    ${horario}
                </div>
            `).join('');
        });
}

function selecionarHorario(horario) {
    horarioSelecionado = horario;
    
    // Destacar horário selecionado
    document.querySelectorAll('.horario-item').forEach(item => {
        item.classList.remove('selected');
        if (item.innerText === horario) {
            item.classList.add('selected');
        }
    });
    
    const horarioInput = document.getElementById('horario');
    if (horarioInput) {
        horarioInput.value = horario;
    }
}