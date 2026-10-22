import { useEffect, useState } from 'react'
import { api, atualizar } from '../api/cliente'
import type { Agendamento, StatusAgendamento } from '../types'
import { paraTextoISO, porExtenso, somarDias } from '../utils/datas'
import { IconeLapis } from './IconeLapis'
import { ModalObservacao } from './ModalObservacao'
import './AgendaDoDia.css'

type Dia = 'hoje' | 'amanha'

// aoMudar: avisa o painel quando uma presença é marcada (para o resumo se atualizar)
export function AgendaDoDia({ aoMudar }: { aoMudar?: () => void }) {
  const [dia, setDia] = useState<Dia>('hoje')
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [editandoObs, setEditandoObs] = useState<Agendamento | null>(null)

  const data = dia === 'hoje' ? new Date() : somarDias(new Date(), 1)
  const dataISO = paraTextoISO(data)
  const ehHoje = dia === 'hoje'

  // Busca a agenda sempre que o dia escolhido muda
  useEffect(() => {
    let cancelado = false
    api<Agendamento[]>(`/agendamentos/?data=${dataISO}`)
      .then((lista) => {
        if (!cancelado) setAgendamentos(lista.filter((a) => a.status !== 'cancelada'))
      })
      .catch(() => !cancelado && setErro('Não foi possível carregar a agenda.'))
      .finally(() => !cancelado && setCarregando(false))
    return () => {
      cancelado = true // se o dia mudar no meio da busca, ignora a resposta antiga
    }
  }, [dataISO])

  function trocarDia(novo: Dia) {
    setDia(novo)
    setCarregando(true)
    setErro('')
    setAviso('')
  }

  // Troca um agendamento da lista pela versão nova que o Django devolveu
  function substituir(novo: Agendamento) {
    setAgendamentos((lista) => lista.map((a) => (a.id === novo.id ? novo : a)))
  }

  async function marcarPresenca(agendamento: Agendamento, escolha: StatusAgendamento) {
    // Clicar de novo no botão já marcado desfaz a marcação
    const status = agendamento.status === escolha ? 'agendada' : escolha
    setErro('')
    try {
      substituir(await atualizar<Agendamento>(`/agendamentos/${agendamento.id}/`, { status }))
      aoMudar?.()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível marcar a presença.')
    }
  }

  async function salvarObservacao(agendamento: Agendamento, observacao: string) {
    substituir(await atualizar<Agendamento>(`/agendamentos/${agendamento.id}/`, { observacao }))
  }

  return (
    <section className="cartao agenda">
      <header className="agenda-topo">
        <h2>Agenda do dia {data.getDate()}</h2>
        <p>{porExtenso(data)}</p>
      </header>

      <div className="agenda-tabela-area">
        <table className="agenda-tabela">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Horário</th>
              <th className="col-tipo">Tipo</th>
              {ehHoje && <th className="centro">Presente?</th>}
              {ehHoje && <th className="centro">Obs</th>}
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((a) => (
              <tr key={a.id} className={`linha-${a.status}${a.encaixe ? ' linha-encaixe' : ''}`}>
                <td className="riscavel">
                  {a.paciente_nome}
                  {a.encaixe && <span className="selo-encaixe">encaixe</span>}
                </td>
                <td className="riscavel">{a.horario}</td>
                <td className="riscavel col-tipo">{a.tipo_nome}</td>
                {ehHoje && (
                  <td className="centro">
                    <div className="presenca">
                      <button
                        type="button"
                        className={`botao-presenca sim${a.status === 'realizada' ? ' marcado' : ''}`}
                        aria-pressed={a.status === 'realizada'}
                        onClick={() => marcarPresenca(a, 'realizada')}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        className={`botao-presenca nao${a.status === 'falta' ? ' marcado' : ''}`}
                        aria-pressed={a.status === 'falta'}
                        onClick={() => marcarPresenca(a, 'falta')}
                      >
                        Não
                      </button>
                    </div>
                  </td>
                )}
                {ehHoje && (
                  <td className="centro">
                    <button
                      type="button"
                      className={`botao-obs${a.observacao ? ' tem-obs' : ''}`}
                      onClick={() => setEditandoObs(a)}
                      aria-label={`Observação de ${a.paciente_nome}`}
                      title={a.observacao || 'Escrever observação'}
                    >
                      <IconeLapis />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {carregando && <p className="agenda-vazia">Carregando...</p>}
        {!carregando && agendamentos.length === 0 && !erro && (
          <p className="agenda-vazia">Nenhum paciente agendado para {ehHoje ? 'hoje' : 'amanhã'}.</p>
        )}
      </div>

      {erro && <p className="mensagem mensagem-erro">{erro}</p>}
      {aviso && <p className="mensagem mensagem-aviso">{aviso}</p>}

      <footer className="agenda-rodape">
        <label className="seletor-dia">
          Dia:
          <select value={dia} onChange={(e) => trocarDia(e.target.value as Dia)}>
            <option value="hoje">Hoje</option>
            <option value="amanha">Amanhã</option>
          </select>
        </label>
        <button
          type="button"
          className="botao-encaixe"
          onClick={() => setAviso('A tela de encaixe vem junto com a tela de Nova consulta.')}
        >
          <IconeLapis /> Adicionar encaixe
        </button>
      </footer>

      {editandoObs && (
        <ModalObservacao
          agendamento={editandoObs}
          aoFechar={() => setEditandoObs(null)}
          aoSalvar={(texto) => salvarObservacao(editandoObs, texto)}
        />
      )}
    </section>
  )
}
