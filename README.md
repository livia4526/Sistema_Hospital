<div align="center">

# 🏥 Sistema Hospital

**Agenda e gestão de pacientes para a recepção de um hospital de olhos**

<img src="https://skillicons.dev/icons?i=django,react,ts,postgres,python&perline=5" alt="Django, React, TypeScript, PostgreSQL, Python" />

![Status](https://img.shields.io/badge/status-em%20migração%20para%20v2-6A1B9A?style=flat-square)
![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square)

</div>

---

## 💡 Sobre

Projeto de estudo que nasceu de um problema real: ajudar a minha mãe, que é secretária em um hospital de olhos, a organizar o dia a dia da recepção. Ela precisa cadastrar pacientes, marcar consultas e cirurgias, controlar quem compareceu e não estourar o limite de atendimentos do dia — tudo isso, hoje, com muita coisa feita à mão.

> ⚠️ Projeto acadêmico e pessoal, **sem vínculo oficial** com nenhum hospital. Nenhum dado real de paciente é usado.

---

## 📈 Evolução do projeto

| | v1 — onde comecei | v2 — para onde estou levando |
|---|---|---|
| **Back-end** | Flask com rotas escritas à mão | Django + Django REST Framework |
| **Front-end** | HTML + CSS + JavaScript puro | React + TypeScript |
| **Banco** | SQLite (arquivo local) | PostgreSQL |
| **Login** | Implementado do zero | Autenticação do Django |
| **Regras de negócio** | Espalhadas entre as rotas | Centralizadas e cobertas por testes |

A **v1** foi feita quando eu só conhecia HTML, CSS e JavaScript: funcionou, mas o código ficou difícil de manter. Depois de aprender React, TypeScript e Django, decidi reconstruir o sistema separando **back-end (API)** e **front-end**, com um banco de dados de verdade e as regras do hospital testadas automaticamente.

A versão original continua guardada na branch [`v1-flask`](../../tree/v1-flask).

---

## ✨ Funcionalidades

- 🔐 **Login** das secretárias
- 👥 **Pacientes** — cadastro, busca por nome ou CPF, edição e histórico de atendimentos
- 🩺 **Consultas** — escolha de data no calendário e horários livres das 08h às 18h
- 👁️ **Cirurgias** — olho operado (OD, OE, AO), tipo de procedimento e preparos
- 📅 **Agenda do dia** — marcação de presença ✅ / falta ❌ e observações por paciente
- 📆 **Calendário semanal** colorido pela ocupação: 🟢 tranquilo · 🟡 moderado · 🔴 cheio
- 📊 **Dashboard** — atendimentos do dia, metas do mês e alertas (aniversariantes, cancelamentos)

---

## 📐 Regras de negócio

| Regra | Limite |
|---|---|
| Consultas normais | 20 por dia |
| Encaixes | 5 por dia |
| Cirurgias | 6 por dia |
| Consulta e cirurgia no mesmo dia | ❌ não permitido |
| CPF duplicado | ❌ não permitido |

O sistema avisa quando um dia está chegando no limite.

---

## 📁 Estrutura

```
Sistema_Hospital/
├── backend/                # API em Django + DRF
│   ├── config/             # configurações e rotas principais
│   ├── pacientes/          # cadastro, busca e histórico
│   ├── agenda/             # consultas, cirurgias, limites e calendário
│   ├── dashboard/          # estatísticas, metas e alertas
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/               # interface em React + TypeScript (Vite)
│   └── src/
│       ├── api/            # comunicação com o back-end
│       ├── components/     # peças reutilizáveis (calendário, lista de horários, modal)
│       ├── pages/          # telas: Login, Dashboard, Pacientes, Agendamento
│       ├── types/          # tipos TypeScript (Paciente, Agendamento...)
│       └── styles/
│
├── .env.example            # modelo das variáveis de ambiente
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Como rodar

**Pré-requisitos:** Python 3.11+, Node.js 20+ e PostgreSQL.

```bash
# 1. Clone o repositório
git clone https://github.com/livia4526/Sistema_Hospital.git
cd Sistema_Hospital

# 2. Back-end
cd backend
python -m venv venv
source venv/bin/activate        # no Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env          # preencha com os dados do seu banco
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver       # http://localhost:8000

# 3. Front-end (em outro terminal)
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

---

## 🗺️ Roteiro da v2

- [ ] Estrutura do back-end em Django + PostgreSQL
- [ ] API de pacientes
- [ ] API de agendamentos com os limites diários e testes
- [ ] Telas em React: login, dashboard, cadastro e agendamento
- [ ] Calendário semanal e agenda do dia
- [ ] Cadastro de várias secretárias
- [ ] Relatórios em PDF/CSV
- [ ] Lembretes reais por WhatsApp e e-mail
- [ ] Modo escuro

---

<div align="center">

Feito com 💜 por [Lívia](https://github.com/livia4526) · Licença [Apache 2.0](LICENSE)

</div>
