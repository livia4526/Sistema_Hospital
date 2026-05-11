import sqlite3
import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

DATABASE = 'hospital.db'

def get_db():
    """Retorna a conexão com o banco de dados"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializa o banco de dados com todas as tabelas"""
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
            ultima_consulta TEXT,
            proxima_consulta TEXT,
            total_consultas INTEGER DEFAULT 0,
            total_cirurgias INTEGER DEFAULT 0,
            total_faltas INTEGER DEFAULT 0
        )
    ''')
    
    # Tabela de consultas/cirurgias
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
            data_agendamento TEXT DEFAULT CURRENT_TIMESTAMP,
            is_encaixe INTEGER DEFAULT 0,
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
    
    # Tabela de usuários (secretárias)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            ativo INTEGER DEFAULT 1,
            data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabela de logs de notificações
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notificacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER,
            tipo TEXT,
            data_envio TEXT,
            status TEXT,
            resposta TEXT,
            FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
        )
    ''')
    
    # Inserir usuário admin padrão se não existir
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
        metas_padrao = [
            ('consultas', 200, 0, datetime.now().month, datetime.now().year),
            ('cirurgias', 50, 0, datetime.now().month, datetime.now().year),
            ('satisfacao', 90, 89, datetime.now().month, datetime.now().year)
        ]
        cursor.executemany(
            "INSERT INTO metas (tipo, meta, alcancado, mes, ano) VALUES (?, ?, ?, ?, ?)",
            metas_padrao
        )
    
    conn.commit()
    conn.close()

def init_app():
    """Função para inicializar o banco ao iniciar o app"""
    init_db()