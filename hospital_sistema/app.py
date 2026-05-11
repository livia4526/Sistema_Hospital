from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from datetime import datetime, timedelta
import sqlite3
import json
import re
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'hos_secret_key_2026_mude_para_uma_segura'

DATABASE = 'hospital.db'

# ===== FUNÇÕES DE BANCO DE DADOS =====
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Tabela de pacientes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pacientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT UNIQUE NOT NULL,
            data_nascimento TEXT NOT NULL,
            sexo TEXT,
            telefone TEXT NOT NULL,
            email TEXT,
            plano TEXT,
            info_complementares TEXT,
            endereco TEXT,
            data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP,
            total_consultas INTEGER DEFAULT 0,
            total_cirurgias INTEGER DEFAULT 0,
            total_faltas INTEGER DEFAULT 0
        )
    ''')
    
    # Tabela de agendamentos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            data TEXT NOT NULL,
            horario TEXT NOT NULL,
            status TEXT DEFAULT 'agendada',
            olho TEXT,
            tipo_procedimento TEXT,
            motivo TEXT,
            observacao TEXT,
            precaucoes TEXT,
            is_encaixe INTEGER DEFAULT 0,
            data_agendamento TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
        )
    ''')
    
    # Tabela de metas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS metas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            meta INTEGER NOT NULL,
            alcancado INTEGER DEFAULT 0,
            mes INTEGER,
            ano INTEGER
        )
    ''')
    
    # Tabela de usuários
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            ativo INTEGER DEFAULT 1
        )
    ''')
    
    # Inserir usuário admin padrão
    cursor.execute("SELECT * FROM usuarios WHERE email = 'admin@hos.com'")
    if not cursor.fetchone():
        senha_hash = generate_password_hash('admin123')
        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
            ('Administrador', 'admin@hos.com', senha_hash)
        )
    
    # Inserir metas padrão
    cursor.execute("SELECT * FROM metas")
    if not cursor.fetchone():
        cursor.executemany(
            "INSERT INTO metas (tipo, meta, alcancado, mes, ano) VALUES (?, ?, ?, ?, ?)",
            [('consultas', 200, 156, datetime.now().month, datetime.now().year),
             ('cirurgias', 50, 42, datetime.now().month, datetime.now().year),
             ('satisfacao', 90, 89, datetime.now().month, datetime.now().year)]
        )
    
    conn.commit()
    conn.close()

# ===== DECORADOR DE LOGIN =====
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# ===== FUNÇÕES AUXILIARES =====
def validar_cpf(cpf):
    cpf = re.sub(r'\D', '', cpf)
    return len(cpf) == 11

def validar_email(email):
    padrao = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(padrao, email) is not None

def calcular_idade(data_nascimento):
    hoje = datetime.now()
    nascimento = datetime.strptime(data_nascimento, '%Y-%m-%d')
    idade = hoje.year - nascimento.year
    if hoje.month < nascimento.month or (hoje.month == nascimento.month and hoje.day < nascimento.day):
        idade -= 1
    return idade

# ===== ROTAS PRINCIPAIS =====
@app.route('/')
def index():
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', session=session)

@app.route('/verificar-cadastro')
@login_required
def verificar_cadastro():
    return render_template('verificar_cadastro.html', session=session)

@app.route('/consulta/nova')
@login_required
def nova_consulta():
    return render_template('nova_consulta.html', session=session)

@app.route('/cirurgia/nova')
@login_required
def nova_cirurgia():
    return render_template('nova_cirurgia.html', session=session)

@app.route('/paciente/novo')
@login_required
def novo_paciente():
    return render_template('novo_paciente.html', session=session)

@app.route('/buscar')
@login_required
def buscar():
    termo = request.args.get('q', '')
    origem = request.args.get('origem', '')
    tipo = request.args.get('tipo', '')
    return render_template('busca_resultados.html', termo=termo, origem=origem, tipo=tipo, session=session)

@app.route('/paciente/detalhes/<int:paciente_id>')
@login_required
def detalhes_paciente(paciente_id):
    return render_template('detalhes_paciente.html', paciente_id=paciente_id, session=session)

# ===== APIS =====
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    email = data.get('username')
    senha = data.get('password')
    
    conn = get_db()
    usuario = conn.execute(
        "SELECT * FROM usuarios WHERE email = ?", (email,)
    ).fetchone()
    conn.close()
    
    if usuario and check_password_hash(usuario['senha'], senha):
        session['logged_in'] = True
        session['username'] = usuario['nome']
        session['user_id'] = usuario['id']
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': 'Usuário ou senha inválidos'}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/verificar_sessao')
def verificar_sessao():
    return jsonify({
        'logado': session.get('logged_in', False),
        'usuario': session.get('username', '')
    })

@app.route('/api/estatisticas/hoje')
@login_required
def estatisticas_hoje():
    hoje = datetime.now().strftime('%Y-%m-%d')
    conn = get_db()
    
    total = conn.execute(
        "SELECT COUNT(*) as total FROM agendamentos WHERE data = ?",
        (hoje,)
    ).fetchone()['total']
    
    compareceram = conn.execute(
        "SELECT COUNT(*) as total FROM agendamentos WHERE data = ? AND status = 'realizada'",
        (hoje,)
    ).fetchone()['total']
    
    faltaram = conn.execute(
        "SELECT COUNT(*) as total FROM agendamentos WHERE data = ? AND status = 'faltou'",
        (hoje,)
    ).fetchone()['total']
    
    pendentes = total - compareceram - faltaram
    
    conn.close()
    
    return jsonify({
        'total_pacientes': total,
        'compareceram': compareceram,
        'faltaram': faltaram,
        'pendentes': pendentes
    })

@app.route('/api/metas')
@login_required
def get_metas():
    conn = get_db()
    metas = conn.execute(
        "SELECT tipo, meta, alcancado FROM metas WHERE mes = ? AND ano = ?",
        (datetime.now().month, datetime.now().year)
    ).fetchall()
    conn.close()
    
    resultado = {}
    for meta in metas:
        resultado[meta['tipo']] = {
            'meta': meta['meta'],
            'alcancado': meta['alcancado']
        }
    
    return jsonify(resultado)

@app.route('/api/alertas')
@login_required
def get_alertas():
    alertas = []
    amanha = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    conn = get_db()
    
    # Pacientes que cancelaram amanhã
    cancelados = conn.execute(
        "SELECT COUNT(*) as total FROM agendamentos WHERE data = ? AND status = 'cancelada'",
        (amanha,)
    ).fetchone()['total']
    
    if cancelados > 0:
        alertas.append({
            'tipo': 'urgente',
            'icone': '⚠️',
            'mensagem': f'{cancelados} pacientes cancelaram a consulta amanhã.'
        })
    
    # Cirurgias sem confirmação
    cirurgias_sem_conf = conn.execute(
        "SELECT COUNT(*) as total FROM agendamentos WHERE data = ? AND tipo = 'cirurgia' AND status = 'agendada'",
        (amanha,)
    ).fetchone()['total']
    
    if cirurgias_sem_conf > 0:
        alertas.append({
            'tipo': 'aviso',
            'icone': '🔪',
            'mensagem': f'{cirurgias_sem_conf} cirurgias agendadas para amanhã sem confirmação!'
        })
    
    # Aniversariantes do dia
    hoje = datetime.now().strftime('%m-%d')
    aniversariantes = conn.execute(
        "SELECT nome FROM pacientes WHERE strftime('%m-%d', data_nascimento) = ?",
        (hoje,)
    ).fetchall()
    
    for aniversariante in aniversariantes:
        alertas.append({
            'tipo': 'info',
            'icone': '🎂',
            'mensagem': f'É o aniversário do paciente {aniversariante["nome"]} hoje!'
        })
    
    conn.close()
    
    return jsonify({'alertas': alertas})

@app.route('/api/agenda/dia')
@login_required
def agenda_dia():
    data = request.args.get('data', datetime.now().strftime('%Y-%m-%d'))
    
    conn = get_db()
    agendamentos = conn.execute('''
        SELECT a.*, p.nome as paciente_nome 
        FROM agendamentos a
        JOIN pacientes p ON a.paciente_id = p.id
        WHERE a.data = ?
        ORDER BY a.horario
    ''', (data,)).fetchall()
    conn.close()
    
    agenda = []
    for item in agendamentos:
        agenda.append({
            'id': item['id'],
            'paciente_id': item['paciente_id'],
            'paciente_nome': item['paciente_nome'],
            'horario': item['horario'],
            'tipo': item['tipo'],
            'status': item['status'],
            'is_encaixe': item['is_encaixe']
        })
    
    return jsonify({
        'data': data,
        'agenda': agenda
    })

@app.route('/api/agenda/<int:agendamento_id>/presenca', methods=['PUT'])
@login_required
def marcar_presenca(agendamento_id):
    data = request.json
    novo_status = 'realizada' if data.get('presente') else 'agendada'
    
    conn = get_db()
    conn.execute(
        "UPDATE agendamentos SET status = ? WHERE id = ?",
        (novo_status, agendamento_id)
    )
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/agenda/<int:agendamento_id>/observacao', methods=['GET', 'PUT'])
@login_required
def gerenciar_observacao(agendamento_id):
    conn = get_db()
    
    if request.method == 'GET':
        obs = conn.execute(
            "SELECT observacao FROM agendamentos WHERE id = ?",
            (agendamento_id,)
        ).fetchone()
        conn.close()
        return jsonify({'observacao': obs['observacao'] if obs else ''})
    
    else:
        data = request.json
        conn.execute(
            "UPDATE agendamentos SET observacao = ? WHERE id = ?",
            (data.get('observacao', ''), agendamento_id)
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/pacientes', methods=['POST'])
@login_required
def criar_paciente():
    data = request.json
    
    # Validações
    if not validar_cpf(data['cpf']):
        return jsonify({'error': 'CPF inválido'}), 400
    
    if data.get('email') and not validar_email(data['email']):
        return jsonify({'error': 'Email inválido'}), 400
    
    conn = get_db()
    
    # Verificar duplicidade
    existe = conn.execute(
        "SELECT id FROM pacientes WHERE cpf = ?",
        (data['cpf'],)
    ).fetchone()
    
    if existe:
        conn.close()
        return jsonify({'error': 'CPF já cadastrado'}), 400
    
    # Inserir paciente
    cursor = conn.execute('''
        INSERT INTO pacientes (nome, cpf, data_nascimento, sexo, telefone, email, plano, info_complementares, endereco)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['nome'], data['cpf'], data['data_nascimento'], data.get('sexo', ''),
        data['telefone'], data.get('email', ''), data.get('plano', ''),
        data.get('info_complementares', ''), data.get('endereco', '')
    ))
    
    paciente_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': paciente_id})

@app.route('/api/pacientes/<int:paciente_id>', methods=['GET', 'PUT'])
@login_required
def gerenciar_paciente(paciente_id):
    conn = get_db()
    
    if request.method == 'GET':
        paciente = conn.execute('''
            SELECT *, 
                   strftime('%Y-%m-%d', data_nascimento) as data_nascimento,
                   (SELECT COUNT(*) FROM agendamentos WHERE paciente_id = ? AND tipo = 'consulta' AND status = 'realizada') as total_consultas,
                   (SELECT COUNT(*) FROM agendamentos WHERE paciente_id = ? AND tipo = 'cirurgia') as total_cirurgias,
                   (SELECT COUNT(*) FROM agendamentos WHERE paciente_id = ? AND status = 'faltou') as total_faltas
            FROM pacientes WHERE id = ?
        ''', (paciente_id, paciente_id, paciente_id, paciente_id)).fetchone()
        
        if not paciente:
            conn.close()
            return jsonify({'error': 'Paciente não encontrado'}), 404
        
        # Buscar agendamentos
        agendamentos = conn.execute('''
            SELECT data, horario, tipo, status 
            FROM agendamentos 
            WHERE paciente_id = ? 
            ORDER BY data DESC, horario DESC
        ''', (paciente_id,)).fetchall()
        
        resultado = dict(paciente)
        resultado['idade'] = calcular_idade(paciente['data_nascimento'])
        resultado['agendamentos'] = [dict(a) for a in agendamentos]
        
        conn.close()
        return jsonify(resultado)
    
    else:
        data = request.json
        conn.execute('''
            UPDATE pacientes 
            SET nome = ?, data_nascimento = ?, sexo = ?, telefone = ?, 
                email = ?, plano = ?, info_complementares = ?, endereco = ?
            WHERE id = ?
        ''', (
            data['nome'], data['data_nascimento'], data.get('sexo', ''),
            data['telefone'], data.get('email', ''), data.get('plano', ''),
            data.get('info_complementares', ''), data.get('endereco', ''), paciente_id
        ))
        conn.commit()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/pacientes/buscar')
@login_required
def buscar_pacientes():
    termo = request.args.get('q', '').lower()
    
    conn = get_db()
    pacientes = conn.execute('''
        SELECT *, 
               (SELECT COUNT(*) FROM agendamentos WHERE paciente_id = pacientes.id) as total_consultas
        FROM pacientes 
        WHERE nome LIKE ? OR cpf LIKE ?
        ORDER BY nome
    ''', (f'%{termo}%', f'%{termo}%')).fetchall()
    conn.close()
    
    resultados = []
    for p in pacientes:
        resultados.append({
            'id': p['id'],
            'nome': p['nome'],
            'cpf': p['cpf'],
            'telefone': p['telefone'],
            'plano': p['plano'],
            'idade': calcular_idade(p['data_nascimento']),
            'total_consultas': p['total_consultas'],
            'tem_consulta_agendada': False  # Será implementado
        })
    
    return jsonify({'pacientes': resultados})

@app.route('/api/agendamentos', methods=['POST'])
@login_required
def criar_agendamento():
    data = request.json
    
    conn = get_db()
    
    # Verificar se já existe consulta/cirurgia no mesmo dia
    if data['tipo'] == 'consulta':
        existe_cirurgia = conn.execute(
            "SELECT id FROM agendamentos WHERE data = ? AND tipo = 'cirurgia'",
            (data['data'],)
        ).fetchone()
        
        if existe_cirurgia:
            conn.close()
            return jsonify({'error': 'Este dia tem cirurgia marcada. Não é possível agendar consultas no mesmo dia.'}), 400
    
    # Verificar limite de consultas (20 normais + 5 encaixes = 25)
    limite_consultas = 20
    limite_encaixes = 5
    
    if data['is_encaixe']:
        encaixes_hoje = conn.execute(
            "SELECT COUNT(*) as total FROM agendamentos WHERE data = ? AND is_encaixe = 1",
            (data['data'],)
        ).fetchone()['total']
        
        if encaixes_hoje >= limite_encaixes:
            conn.close()
            return jsonify({'error': f'Limite de {limite_encaixes} encaixes para este dia já foi atingido'}), 400
    else:
        consultas_hoje = conn.execute(
            "SELECT COUNT(*) as total FROM agendamentos WHERE data = ? AND tipo = 'consulta' AND is_encaixe = 0",
            (data['data'],)
        ).fetchone()['total']
        
        if consultas_hoje >= limite_consultas:
            conn.close()
            return jsonify({'error': f'Limite de {limite_consultas} consultas para este dia já foi atingido. Utilize a opção de encaixe.'}), 400
    
    # Inserir agendamento
    cursor = conn.execute('''
        INSERT INTO agendamentos (paciente_id, tipo, data, horario, motivo, observacao, olho, tipo_procedimento, precaucoes, is_encaixe)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['paciente_id'], data['tipo'], data['data'], data['horario'],
        data.get('motivo', ''), data.get('observacao', ''), data.get('olho', ''),
        data.get('tipo_procedimento', ''), data.get('precaucoes', ''),
        1 if data.get('is_encaixe') else 0
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': cursor.lastrowid})

@app.route('/api/horarios_disponiveis')
@login_required
def horarios_disponiveis():
    data = request.args.get('data')
    tipo = request.args.get('tipo', 'consulta')
    
    if not data:
        return jsonify({'horarios': []})
    
    conn = get_db()
    ocupados = conn.execute(
        "SELECT horario FROM agendamentos WHERE data = ?",
        (data,)
    ).fetchall()
    conn.close()
    
    ocupados_set = set([o['horario'] for o in ocupados])
    
    horarios = []
    for hora in range(8, 19):
        for minuto in [0, 30]:
            horario = f"{hora:02d}:{minuto:02d}"
            if horario not in ocupados_set:
                # Para cirurgia, apenas horários inteiros (8:00, 9:00, etc)
                if tipo == 'cirurgia' and minuto != 0:
                    continue
                horarios.append(horario)
    
    return jsonify({'horarios': horarios})

@app.route('/api/calendario/semanal')
@login_required
def calendario_semanal():
    offset = int(request.args.get('offset', 0))
    hoje = datetime.now()
    inicio_semana = hoje - timedelta(days=hoje.weekday()) + timedelta(days=offset*7)
    
    dias = []
    for i in range(7):
        dia_atual = inicio_semana + timedelta(days=i)
        data_str = dia_atual.strftime('%Y-%m-%d')
        nome_dia = dia_atual.strftime('%A').capitalize()
        
        conn = get_db()
        total_consultas = conn.execute(
            "SELECT COUNT(*) as total FROM agendamentos WHERE data = ? AND tipo = 'consulta'",
            (data_str,)
        ).fetchone()['total']
        
        total_cirurgias = conn.execute(
            "SELECT COUNT(*) as total FROM agendamentos WHERE data = ? AND tipo = 'cirurgia'",
            (data_str,)
        ).fetchone()['total']
        conn.close()
        
        total = total_consultas + total_cirurgias
        percentual = min(100, int((total / 25) * 100))  # 25 é o máximo (20 consultas + 5 encaixes)
        
        if percentual <= 50:
            status = 'tranquilo'
            status_texto = 'Tranquilo'
        elif percentual <= 80:
            status = 'moderado'
            status_texto = 'Moderado'
        else:
            status = 'cheio'
            status_texto = 'Cheio'
        
        dias.append({
            'nome': nome_dia[:3],
            'data': data_str,
            'data_formatada': dia_atual.strftime('%d/%m'),
            'status': status,
            'status_texto': status_texto,
            'percentual': percentual,
            'total_consultas': total_consultas,
            'total_cirurgias': total_cirurgias,
            'vagas_encaixe': max(0, 5 - total_consultas) if total_cirurgias == 0 else 0
        })
    
    semanas = ['Atual', 'Próxima', 'Seguinte']
    semana_titulo = semanas[min(abs(offset), 2)] if offset >= 0 else 'Anterior'
    
    return jsonify({
        'dias': dias,
        'semana_titulo': f"{semana_titulo} semana"
    })

@app.route('/api/dias_com_cirurgia')
@login_required
def dias_com_cirurgia():
    mes = request.args.get('mes', type=int)
    ano = request.args.get('ano', type=int)
    
    if not mes or not ano:
        return jsonify([])
    
    conn = get_db()
    dias = conn.execute('''
        SELECT DISTINCT data FROM agendamentos 
        WHERE tipo = 'cirurgia' AND strftime('%m', data) = ? AND strftime('%Y', data) = ?
    ''', (str(mes).zfill(2), str(ano))).fetchall()
    conn.close()
    
    return jsonify([d['data'] for d in dias])

# Inicializar banco de dados
init_db()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)