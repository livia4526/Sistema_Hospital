import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, atualizar } from '../api/cliente'
import { Cabecalho } from '../components/Cabecalho'
import { CamposPaciente } from '../components/CamposPaciente'
import { RemarcarAgendamento } from '../components/RemarcarAgendamento'
import type { Agendamento, Paciente } from '../types'
import { diaEMesEAno, paraTextoISO } from '../utils/datas'
import { errosDoDjango } from '../utils/erros'
import { mascaraCPF, mascaraCelular } from '../utils/mascaras'
import {
  CAMPOS_VAZIOS, paraEnviar, validarPaciente, type CamposDoPaciente, type ErrosDoPaciente,
} from '../utils/paciente'
import './FichaPaciente.css'
import './Formulario.css'

// Converte o paciente que vem da API para os campos do formulário (com as máscaras)
function paraCampos(p: Paciente): CamposDoPaciente {
  return {
    nome: p.nome,
    data_nascimento: p.data_nascimento,
    sexo: p.sexo,
    plano: p.plano,
    plano_outro: p.plano_outro,
    celular: mascaraCelular(p.celular),
    email: p.email,
    cpf: mascaraCPF(p.cpf),
    informacoes_complementares: p.informacoes_complementares,
  }
}

export function FichaPaciente() {
  const { id } = useParams()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [campos, setCampos] = useState<CamposDoPaciente>(CAMPOS_VAZIOS)
  const [editando, setEditando] = useState(false)
  const [erros, setErros] = useState<ErrosDoPaciente>({})
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [remarcando, setRemarcando] = useState<number | null>(null)
  const [cancelando, setCancelando] = useState<number | null>(null)
  const [naoEncontrado, setNaoEncontrado] = useState(false)

  const carregarHistorico = useCallback(() => {
    api<Agendamento[]>(`/agendamentos/?paciente=${id}`)
      .then((lista) => setAgendamentos([...lista].reverse())) // mais recentes primeiro
      .catch(() => setAgendamentos([]))
  }, [id])

  useEffect(() => {
    api<Paciente>(`/pacientes/${id}/`)
      .then((p) => {
        setPaciente(p)
        setCampos(paraCampos(p))
      })
      .catch(() => setNaoEncontrado(true))
    carregarHistorico()
  }, [id, carregarHistorico])

  function mudar(campo: keyof CamposDoPaciente, valor: string) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: undefined }))
  }

  function cancelarEdicao() {
    if (paciente) setCampos(paraCampos(paciente)) // desfaz o que foi digitado
    setErros({})
    setEditando(false)
  }

  async function salvar() {
    const encontrados = validarPaciente(campos)
    if (Object.keys(encontrados).length) {
      setErros(encontrados)
      return
    }
    setSalvando(true)
    try {
      const atualizado = await atualizar<Paciente>(`/pacientes/${id}/`, paraEnviar(campos))
      setPaciente(atualizado)
      setCampos(paraCampos(atualizado))
      setEditando(false)
      setSalvo(true)
    } catch (e) {
      setErros(errosDoDjango(e, Object.keys(CAMPOS_VAZIOS)) as ErrosDoPaciente)
    } finally {
      setSalvando(false)
    }
  }

  async function cancelarAgendamento(agendamento: Agendamento) {
    await atualizar(`/agendamentos/${agendamento.id}/`, { status: 'cancelada' })
    setCancelando(null)
    carregarHistorico()
  }

  if (naoEncontrado) {
    return (
      <div className="pagina">
        <Cabecalho />
        <main className="pagina-formulario">
          <Link to="/pacientes" className="voltar">← Voltar à busca</Link>
          <p className="mensagem mensagem-erro">Paciente não encontrado.</p>
        </main>
      </div>
    )
  }
  if (!paciente) return null

  const hoje = paraTextoISO(new Date())

  return (
    <div className="pagina">
      <Cabecalho />
      <main className="pagina-formulario ficha">
        <Link to="/pacientes" className="voltar">← Voltar à busca</Link>

        <section className="cartao-formulario tema-ficha">
          <div className="ficha-topo">
            <h1>{paciente.nome}</h1>
            <span className="ficha-idade">{paciente.idade} anos</span>
          </div>

          <CamposPaciente campos={campos} erros={erros} mudar={mudar} somenteLeitura={!editando} />
          {erros.geral && <p className="mensagem mensagem-erro">{erros.geral}</p>}
          {salvo && !editando && <p className="mensagem mensagem-aviso">Dados atualizados.</p>}

          <div className="rodape-formulario">
            {editando ? (
              <div className="botoes-sucesso">
                <button type="button" className="botao-formulario contorno" onClick={cancelarEdicao}>Cancelar</button>
                <button type="button" className="botao-formulario" onClick={salvar} disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="botao-formulario"
                onClick={() => {
                  setEditando(true)
                  setSalvo(false)
                }}
              >
                Editar
              </button>
            )}
          </div>
        </section>

        <section className="cartao historico">
          <header className="historico-topo">
            <h2>Atendimentos</h2>
            <div className="historico-acoes">
              <Link to={`/agendar/consulta?paciente=${paciente.id}`} className="acao-pequena azul">+ Consulta</Link>
              <Link to={`/agendar/cirurgia?paciente=${paciente.id}`} className="acao-pequena azul-claro">+ Cirurgia</Link>
            </div>
          </header>

          {agendamentos.length === 0 && <p className="historico-vazio">Nenhum atendimento ainda.</p>}

          <ul className="historico-lista">
            {agendamentos.map((a) => {
              const futuro = a.status === 'agendada' && a.data >= hoje
              return (
                <li key={a.id} className="historico-item">
                  <div className="historico-linha">
                    <span className={`bolinha-status ${a.status}`} aria-hidden="true" />
                    <span className="historico-data">{diaEMesEAno(a.data)} · {a.horario}</span>
                    <span>{a.tipo_nome}{a.encaixe ? ' (encaixe)' : ''}</span>
                    <span className={`selo-status ${a.status}`}>{a.status_nome}</span>
                    {futuro && remarcando !== a.id && cancelando !== a.id && (
                      <span className="historico-botoes">
                        <button type="button" className="link" onClick={() => setRemarcando(a.id)}>Remarcar</button>
                        <button type="button" className="link link-perigo" onClick={() => setCancelando(a.id)}>
                          Cancelar
                        </button>
                      </span>
                    )}
                  </div>
                  {a.observacao && <p className="historico-obs">Obs.: {a.observacao}</p>}

                  {cancelando === a.id && (
                    <div className="confirmar-cancelamento">
                      Cancelar este agendamento?
                      <button type="button" className="botao-pequeno perigo" onClick={() => cancelarAgendamento(a)}>
                        Sim, cancelar
                      </button>
                      <button type="button" className="botao-pequeno contorno" onClick={() => setCancelando(null)}>
                        Não
                      </button>
                    </div>
                  )}

                  {remarcando === a.id && (
                    <RemarcarAgendamento
                      agendamento={a}
                      aoDesistir={() => setRemarcando(null)}
                      aoRemarcar={() => {
                        setRemarcando(null)
                        carregarHistorico()
                      }}
                    />
                  )}
                </li>
              )
            })}
          </ul>

          <p className="legenda">
            <span><span className="bolinha-status agendada" /> Agendada</span>
            <span><span className="bolinha-status realizada" /> Realizada</span>
            <span><span className="bolinha-status falta" /> Faltou</span>
            <span><span className="bolinha-status remarcada" /> Remarcada</span>
            <span><span className="bolinha-status cancelada" /> Cancelada</span>
          </p>
        </section>
      </main>
    </div>
  )
}
