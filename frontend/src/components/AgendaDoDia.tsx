import { useEffect, useState } from 'react'
import { api, atualizar } from '../api/cliente'
import type { Agendamento, StatusAgendamento } from '../types'
import { deTextoISO, diaEMes, paraTextoISO, porExtenso, somarDias } from '../utils/datas'
import { IconeLapis } from './IconeLapis'
import { ModalObservacao } from './ModalObservacao'
import './AgendaDoDia.css'

type Props = {
  dataISO: string // o dia mostrado, ex.: "2026-10-22" (quem escolhe é o painel)
  aoTrocarData: (dataISO: string) => void
  aoMudar?: () => void // avisa o painel quando uma presença é marcada
}

export function AgendaDoDia({ dataISO, aoTrocarData, aoMudar }: Props) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [editandoObs, setEditandoObs] = useState<Agendamento | null>(null)

  const hojeISO = paraTextoISO(new Date())
  const amanhaISO = paraTextoISO(somarDias(new Date(), 1))
  const data = deTextoISO(dataISO)
  const ehHoje = dataISO === hojeISO // só a agenda de hoje permite marcar presença
  const outroDia = dataISO !== hojeISO && dataISO !== amanhaISO

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

  function trocarDia(novo: string) {
    aoTrocarData(novo)
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
          <p className="agenda-vazia">
            Nenhum paciente agendado para {ehHoje ? 'hoje' : dataISO === amanhaISO ? 'amanhã' : 'este dia'}.
          </p>
        )}
      </div>

      {erro && <p className="mensagem mensagem-erro">{erro}</p>}
      {aviso && <p className="mensagem mensagem-aviso">{aviso}</p>}

      <footer className="agenda-rodape">
        <label className="seletor-dia">
          Dia:
          <select value={dataISO} onChange={(e) => trocarDia(e.target.value)}>
            <option value={hojeISO}>Hoje</option>
            <option value={amanhaISO}>Amanhã</option>
            {/* dia escolhido no calendário semanal */}
            {outroDia && <option value={dataISO}>{diaEMes(dataISO)}</option>}
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
