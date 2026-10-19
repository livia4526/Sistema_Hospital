<div align="center">

# 🏥 Sistema Hospital — v1 (Flask)

**Primeira versão do sistema de agenda e gestão de pacientes para a recepção de um hospital de olhos**

![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.3-000000?style=flat-square&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/status-arquivada-lightgrey?style=flat-square)

</div>

> 📦 **Esta é a versão arquivada do projeto.** O desenvolvimento continua na branch [`main`](../../tree/main), onde o sistema está sendo reconstruído com **Django + React + TypeScript + PostgreSQL**.

---

## 💡 Sobre

Projeto de estudo feito para ajudar a rotina de uma secretária de hospital de olhos: cadastrar pacientes, marcar consultas e cirurgias, controlar a presença e respeitar os limites de atendimento de cada dia.

Esta versão foi construída quando eu conhecia apenas **HTML, CSS e JavaScript**, com um back-end simples em **Flask** e banco **SQLite**.

> ⚠️ Projeto acadêmico e pessoal, **sem vínculo oficial** com nenhum hospital. Nenhum dado real de paciente é usado.

---

## ✨ Funcionalidades

- 🔐 **Login** com validação de senha
- 👥 **Pacientes** — cadastro, busca por nome ou CPF, edição e histórico de atendimentos
- 🩺 **Consultas** — calendário visual e horários livres das 08h às 18h
- 👁️ **Cirurgias** — olho operado (OD, OE, AO), tipo de procedimento e preparos
- 📅 **Agenda do dia** — filtro Hoje/Amanhã, presença ✅ / falta ❌ e observações por paciente
- 📆 **Calendário semanal** colorido pela ocupação: 🟢 tranquilo · 🟡 moderado · 🔴 cheio
- 📊 **Dashboard** — estatísticas do dia, metas do mês e alertas
- 💬 **Lembretes por WhatsApp e e-mail** (simulados)

---

## 📐 Regras de negócio

| Regra | Limite |
|---|---|
| Consultas normais | 20 por dia |
| Encaixes | 5 por dia |
| Cirurgias | 6 por dia |
| Consulta e cirurgia no mesmo dia | ❌ não permitido |
| CPF duplicado | ❌ não permitido |

---

## 📁 Estrutura

```
hospital_sistema/
├── app.py              # rotas e API (Flask)
├── database.py         # criação das tabelas (SQLite)
├── utils.py            # funções auxiliares
├── requirements.txt
├── templates/          # páginas HTML
│   ├── base.html
│   ├── login.html
│   ├── dashboard.html
│   ├── verificar_cadastro.html
│   ├── novo_paciente.html
│   ├── nova_consulta.html
│   ├── nova_cirurgia.html
│   ├── busca_resultados.html
│   ├── detalhes_paciente.html
│   └── components/     # calendário, lista de horários, modal de observação
└── static/
    ├── css/            # estilos por tela
    ├── js/             # interatividade e chamadas à API
    └── assets/images/
```

---

## 🚀 Como rodar

```bash
# 1. Clone esta branch
git clone -b v1-flask https://github.com/livia4526/Sistema_Hospital.git
cd Sistema_Hospital/hospital_sistema

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Rode o sistema
python app.py
```

Acesse **http://localhost:5000** e entre com o usuário de demonstração:

| Usuário | Senha |
|---|---|
| `admin@hos.com` | `admin123` |

> Usuário criado automaticamente apenas para testes locais.

---

## 🔁 Por que existe uma v2?

Esta versão funcionou, mas as regras de negócio ficaram espalhadas pelas rotas e o front-end cresceu difícil de manter. Depois de aprender React, TypeScript e Django, decidi reconstruir o sistema separando **API** e **interface**, com PostgreSQL e testes automatizados para as regras do hospital.

👉 Veja a evolução na branch [`main`](../../tree/main).

---

<div align="center">

Feito com 💜 por [Lívia](https://github.com/livia4526) · Licença [Apache 2.0](LICENSE)

</div>
