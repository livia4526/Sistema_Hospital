import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ErroDaApi, enviar } from '../api/cliente'
import { Cabecalho } from '../components/Cabecalho'
import { PLANOS, type Paciente } from '../types'
import { paraTextoISO } from '../utils/datas'
import { mascaraCPF, mascaraCelular, soNumeros } from '../utils/mascaras'
import './Formulario.css'

const VAZIO = {
  nome: '',
  data_nascimento: '',
  sexo: '',
  plano: 'particular',
  plano_outro: '',
  celular: '',
  email: '',
  cpf: '',
  informacoes_complementares: '',
}

type Campos = typeof VAZIO
type Erros = Partial<Record<keyof Campos | 'geral', string>>

// Confere o básico antes de enviar; o Django confere tudo de novo (CPF repetido, etc.)
function validar(campos: Campos): Erros {
  const erros: Erros = {}
  if (!campos.nome.trim()) erros.nome = 'Informe o nome.'
  if (!campos.data_nascimento) erros.data_nascimento = 'Informe a data de nascimento.'
  if (soNumeros(campos.celular).length < 10) erros.celular = 'Informe o celular com DDD.'
  if (soNumeros(campos.cpf).length !== 11) erros.cpf = 'O CPF deve ter 11 números.'
  if (campos.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(campos.email)) erros.email = 'E-mail inválido.'
  if (campos.plano === 'outros' && !campos.plano_outro.trim()) erros.plano_outro = 'Informe qual é o plano.'
  return erros
}

// O Django devolve os erros assim: { "cpf": ["Paciente com este CPF já existe."] }
function errosDoDjango(dados: unknown): Erros {
  if (!dados || typeof dados !== 'object') return { geral: 'Não foi possível cadastrar.' }
  const erros: Erros = {}
  for (const [campo, mensagens] of Object.entries(dados)) {
    const texto = Array.isArray(mensagens) ? mensagens.join(' ') : String(mensagens)
    const chave = (campo in VAZIO ? campo : 'geral') as keyof Erros
    erros[chave] = texto
  }
  return erros
}

export function NovoPaciente() {
  const [campos, setCampos] = useState<Campos>(VAZIO)
  const [erros, setErros] = useState<Erros>({})
  const [enviando, setEnviando] = useState(false)
  const [cadastrado, setCadastrado] = useState<Paciente | null>(null)

  // Atualiza um campo só, mantendo os outros
  function mudar(campo: keyof Campos, valor: string) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: undefined }))
  }

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    const encontrados = validar(campos)
    if (Object.keys(encontrados).length) {
      setErros(encontrados)
      return
    }
    setEnviando(true)
    try {
      const paciente = (await enviar('/pacientes/', {
        ...campos,
        cpf: soNumeros(campos.cpf),
        celular: soNumeros(campos.celular),
      })) as Paciente
      setCadastrado(paciente)
      setCampos(VAZIO)
    } catch (e) {
      setErros(e instanceof ErroDaApi ? errosDoDjango(e.dados) : { geral: 'Não foi possível cadastrar.' })
    } finally {
      setEnviando(false)
    }
  }

  // Mostra a mensagem de erro de um campo, se houver
  const erro = (campo: keyof Erros) =>
    erros[campo] ? <span className="erro-campo">{erros[campo]}</span> : null

  return (
    <div className="pagina">
      <Cabecalho />
      <main className="pagina-formulario">
        <Link to="/" className="voltar">← Voltar ao painel</Link>

        {cadastrado ? (
          <section className="cartao-formulario tema-paciente sucesso">
            <h1>Paciente cadastrado!</h1>
            <p>O cadastro de {cadastrado.nome} foi concluído.</p>
            <div className="botoes-sucesso">
              <button type="button" className="botao-formulario" onClick={() => setCadastrado(null)}>
                Cadastrar outro paciente
              </button>
              <Link to="/" className="botao-formulario contorno">Voltar ao painel</Link>
            </div>
          </section>
        ) : (
          <form className="cartao-formulario tema-paciente" onSubmit={aoEnviar} noValidate>
            <h1>Novo paciente</h1>

            <div className="grade">
              <label className="campo-form largura-toda">
                <span>Nome</span>
                <input value={campos.nome} onChange={(e) => mudar('nome', e.target.value)} placeholder="Nome" />
                {erro('nome')}
              </label>

              <label className="campo-form">
                <span>Data de nascimento</span>
                <input
                  type="date"
                  max={paraTextoISO(new Date())}
                  value={campos.data_nascimento}
                  onChange={(e) => mudar('data_nascimento', e.target.value)}
                />
                {erro('data_nascimento')}
              </label>

              <label className="campo-form">
                <span>Sexo</span>
                <select value={campos.sexo} onChange={(e) => mudar('sexo', e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                  <option value="O">Outro</option>
                </select>
              </label>

              <label className="campo-form">
                <span>Plano</span>
                <select value={campos.plano} onChange={(e) => mudar('plano', e.target.value)}>
                  {PLANOS.map((p) => (
                    <option key={p.valor} value={p.valor}>{p.nome}</option>
                  ))}
                </select>
              </label>

              <label className="campo-form">
                <span>Celular</span>
                <input
                  inputMode="numeric"
                  placeholder="(79) 99999-9999"
                  value={campos.celular}
                  onChange={(e) => mudar('celular', mascaraCelular(e.target.value))}
                />
                {erro('celular')}
              </label>

              {/* Só aparece quando o plano é "Outros" */}
              {campos.plano === 'outros' && (
                <label className="campo-form largura-toda">
                  <span>Qual plano?</span>
                  <input
                    value={campos.plano_outro}
                    onChange={(e) => mudar('plano_outro', e.target.value)}
                    placeholder="Nome do plano"
                  />
                  {erro('plano_outro')}
                </label>
              )}

              <label className="campo-form largura-3">
                <span>E-mail</span>
                <input
                  type="email"
                  placeholder="Email"
                  value={campos.email}
                  onChange={(e) => mudar('email', e.target.value)}
                />
                {erro('email')}
              </label>

              <label className="campo-form">
                <span>CPF</span>
                <input
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={campos.cpf}
                  onChange={(e) => mudar('cpf', mascaraCPF(e.target.value))}
                />
                {erro('cpf')}
              </label>

              <label className="campo-form largura-toda">
                <span>Informações complementares</span>
                <textarea
                  rows={3}
                  placeholder="Ex.: Diabético, Hipertenso, Alérgico..."
                  value={campos.informacoes_complementares}
                  onChange={(e) => mudar('informacoes_complementares', e.target.value)}
                />
              </label>
            </div>

            {erros.geral && <p className="mensagem mensagem-erro">{erros.geral}</p>}

            <div className="rodape-formulario">
              <button type="submit" className="botao-formulario" disabled={enviando}>
                {enviando ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
