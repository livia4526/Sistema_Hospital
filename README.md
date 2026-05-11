# 🏥 HOS - Hospital de Olhos de Sergipe

Sistema de gerenciamento hospitalar desenvolvido para o **Hospital de Olhos de Sergipe (HOS)**. Uma solução completa para secretárias e médicos gerenciarem pacientes, consultas, cirurgias e agenda.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-green)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![Flask](https://img.shields.io/badge/Flask-2.3.3-blue)
![SQLite](https://img.shields.io/badge/SQLite-3.0-blue)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Telas do Sistema](#telas-do-sistema)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Credenciais de Acesso](#credenciais-de-acesso)
- [Regras de Negócio](#regras-de-negócio)
- [Próximas Implementações](#próximas-implementações)
- [Licença](#licença)

---

## 📖 Sobre o Projeto

O **HOS** é um sistema de gerenciamento hospitalar desenvolvido sob medida para otimizar o fluxo de trabalho de secretárias e médicos do Hospital de Olhos de Sergipe. O sistema permite:

- ✅ Cadastro completo de pacientes
- ✅ Agendamento de consultas e cirurgias
- ✅ Controle de agenda diária com limites
- ✅ Histórico de atendimentos
- ✅ Alertas e lembretes automáticos
- ✅ Estatísticas e metas

---

## 🖥️ Telas do Sistema

| Tela | Descrição |
|------|-----------|
| **Login** | Autenticação de usuários com validação de senha |
| **Dashboard** | Visão geral: estatísticas, metas, alertas e agenda do dia |
| **Verificar Cadastro** | Pergunta se paciente já existe no sistema |
| **Nova Consulta** | Agendamento de consultas médicas |
| **Nova Cirurgia** | Agendamento de procedimentos cirúrgicos |
| **Novo Paciente** | Cadastro de novos pacientes |
| **Busca de Pacientes** | Pesquisa por nome ou CPF |
| **Detalhes do Paciente** | Informações completas + edição |

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.11+** - Linguagem principale
- **Flask 2.3.3** - Framework web
- **SQLite3** - Banco de dados local
- **Werkzeug** - Segurança e hashing de senhas

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização e layout responsivo
- **JavaScript (Vanilla)** - Interatividade e requisições AJAX

### Bibliotecas Adicionais
- **Font Awesome 6** - Ícones
- **Google Fonts** - Tipografia moderna

---

## ✨ Funcionalidades

### 🔐 Autenticação
- Login com usuário e senha
- Validação de senha (mínimo 8 caracteres com letras, números e símbolos)
- Integração com Google (mock)

### 👥 Gestão de Pacientes
- Cadastro completo (nome, CPF, telefone, email, plano de saúde)
- Validação de CPF (11 dígitos)
- Validação de email (formato válido)
- Máscaras automáticas para CPF e telefone
- Edição de dados cadastrais
- Histórico de atendimentos

### 🩺 Agendamento de Consultas
- Busca de pacientes cadastrados
- Seleção de data via calendário visual
- Seleção de horários disponíveis (08:00 às 18:00)
- Motivo da consulta
- Observações adicionais

### 🔪 Agendamento de Cirurgias
- Busca de pacientes cadastrados
- Seleção de data via calendário visual
- Seleção de horários disponíveis (apenas horários inteiros)
- Olho a ser operado (OD, OE, AO)
- Tipo de cirurgia (Catarata, Miopia, Glaucoma, etc.)
- Precauções e preparos especiais

### 📅 Agenda
- Visualização diária da agenda
- Filtro: Hoje / Amanhã
- Marcação de presença (✅ compareceu / ❌ faltou)
- Observações por consulta (ícone de caneta)
- Scroll vertical para dias cheios (até 25 pacientes)
- Destaque visual para encaixes (azul escuro)

### 📆 Calendário Semanal
- Visualização dos próximos 7 dias
- Cores por nível de ocupação:
  - 🟢 **Tranquilo** (≤ 50% ocupado)
  - 🟡 **Moderado** (51-80% ocupado)
  - 🔴 **Cheio** (≥ 81% ocupado)
- Scroll horizontal para navegação
- Seletor de semana (Atual / Próxima)

### 📊 Dashboard
- Estatísticas do dia (Total, Compareceram, Faltaram, Pendentes)
- Metas mensais (Consultas, Cirurgias, Satisfação)
- Alertas importantes (cancelamentos, aniversariantes, confirmações)

### 💬 Notificações
- Lembretes automáticos (simulado)
- WhatsApp (integração simulada)
- Email (integração simulada)

---

## 📁 Estrutura do Projeto

hospital_sistema/
│
├── app.py # Backend principal (Flask)
├── requirements.txt # Dependências do projeto
├── database.py # Gerenciamento do banco de dados SQLite
├── utils.py # Funções utilitárias
├── hospital.db # Banco de dados (criado automaticamente)
│
├── static/
│ ├── css/
│ │ ├── style.css
│ │ ├── components.css
│ │ ├── dashboard.css
│ │ ├── forms.css
│ │ └── calendar.css
│ │
│ ├── js/
│ │ ├── main.js
│ │ ├── api.js
│ │ ├── dashboard.js
│ │ ├── calendar.js
│ │ ├── forms.js
│ │ ├── busca.js
│ │ └── whatsapp.js
│ │
│ └── assets/
│
└── templates/
├── base.html
├── login.html
├── dashboard.html
├── verificar_cadastro.html
├── nova_consulta.html
├── nova_cirurgia.html
├── novo_paciente.html
├── busca_resultados.html
└── detalhes_paciente.html


---

## 📋 Pré-requisitos

- **Python 3.11 ou superior** - [Download Python](https://www.python.org/downloads/)
- **Pip** - Gerenciador de pacotes do Python

---

## 🚀 Instalação e Execução

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/hospital_sistema.git
cd hospital_sistema

# 2. Instale as dependências
pip install flask

# 3. Execute o sistema
python app.py

# 4. Acesse no navegador
# http://localhost:5000

🔑 Credenciais de Acesso
Usuário	Senha
admin@hos.com	admin123
⚠️ Importante: Altere a senha do administrador após o primeiro acesso.

📐 Regras de Negócio
Limites de Agendamento
Tipo	Limite Diário
Consultas normais	20 por dia
Encaixes	5 por dia
Total de consultas	25 por dia
Cirurgias	6 por dia
Regras Importantes
❌ Não é possível ter consultas e cirurgias no mesmo dia

⚠️ O sistema avisa quando o limite está próximo ou atingido

🔄 Cirurgias ocupam o centro cirúrgico por períodos mais longos

Validações
✅ CPF deve ter 11 dígitos

✅ Email deve conter "@" e "."

✅ Telefone com máscara automática

✅ Não permite duplicidade de CPF

🔮 Próximas Implementações
Cadastro de múltiplos usuários (secretárias)

Tela de configurações do sistema

Perfil do usuário

Relatórios avançados (exportação PDF/CSV)

Envio real de WhatsApp (integração com API)

Envio real de email (SMTP)

Backup automático do banco de dados

Modo escuro

Integração com agenda do Google ```

<p align="center">Feito com ❤️ para o Hospital de Olhos de Sergipe</p>
