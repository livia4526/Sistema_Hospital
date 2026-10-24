import { useEffect, useState } from 'react'
import { api, enviar } from '../api/cliente'
import type { Agendamento, HorariosLivres } from '../types'
import { paraTextoISO } from '../utils/datas'
import { errosDoDjango } from '../utils/erros'

type Props = {
  agendamento: Agendamento
  aoRemarcar: () => void
  aoDesistir: () => void
}

// Mini formulário que aparece na ficha ao clicar em "Remarcar"
export function RemarcarAgendamento({ agendamento, aoRemarcar, aoDesistir }: Props) {
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [livres, setLivres] = useState<HorariosLivres | null>(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!data) return
    api<HorariosLivres>(`/agendamentos/horarios-livres/?data=${data}&tipo=${agendamento.tipo}`)
      .then(setLivres)
      .catch(() => setErro('Não foi possível buscar os horários.'))
  }, [data, agendamento.tipo])

  async function confirmar() {
    if (!data || !horario) {
      setErro('Escolha a nova data e o horário.')
      return
    }
    setEnviando(true)
    try {
      await enviar(`/agendamentos/${agendamento.id}/remarcar/`, { data, horario })
      aoRemarcar()
    } catch (e) {
      const erros = errosDoDjango(e, [])
      setErro(Object.values(erros).filter(Boolean).join(' '))
      setEnviando(false)
    }
  }

  return (
    <div className="remarcar">
      <label>
        Nova data
        <input
          type="date"
          min={paraTextoISO(new Date())}
          value={data}
          onChange={(e) => {
            setData(e.target.value)
            setHorario('')
            setLivres(null)
            setErro('')
          }}
        />
      </label>
      <label>
        Horário
        <select value={horario} disabled={!livres?.horarios.length} onChange={(e) => setHorario(e.target.value)}>
          <option value="">{!data ? 'Escolha a data' : livres ? 'Selecione' : 'Carregando...'}</option>
          {livres?.horarios.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </label>
      <div className="remarcar-botoes">
        <button type="button" className="botao-pequeno" onClick={confirmar} disabled={enviando}>
          {enviando ? 'Remarcando...' : 'Confirmar'}
        </button>
        <button type="button" className="botao-pequeno contorno" onClick={aoDesistir}>Voltar</button>
      </div>
      {(livres?.aviso || erro) && <p className="mensagem mensagem-erro">{erro || livres?.aviso}</p>}
    </div>
  )
}
