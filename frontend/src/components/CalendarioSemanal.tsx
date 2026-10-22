import { useEffect, useState } from 'react'
import { api } from '../api/cliente'
import type { DiaDaSemana, NivelDeOcupacao, Semana } from '../types'
import { diaEMes } from '../utils/datas'
import './CalendarioSemanal.css'

const ROTULO_DO_NIVEL: Record<NivelDeOcupacao, string> = {
  tranquilo: 'Tranquilo',
  moderado: 'Moderado',
  cheio: 'Cheio',
}

const SEMANAS = [
  { valor: 0, rotulo: 'Atual' },
  { valor: 1, rotulo: 'Próxima' },
  { valor: 2, rotulo: 'Daqui a 2 semanas' },
  { valor: 3, rotulo: 'Daqui a 3 semanas' },
]

function descricao(dia: DiaDaSemana) {
  if (dia.quantidade === 0) return 'Nenhum agendamento.'
  if (dia.tipo === 'cirurgia') {
    return `${dia.quantidade} ${dia.quantidade === 1 ? 'cirurgia marcada' : 'cirurgias marcadas'}.`
  }
  return `${dia.quantidade} ${dia.quantidade === 1 ? 'consulta agendada' : 'consultas agendadas'}.`
}

type Props = {
  diaSelecionado: string
  aoEscolherDia: (dataISO: string) => void
}

export function CalendarioSemanal({ diaSelecionado, aoEscolherDia }: Props) {
  const [semana, setSemana] = useState(0)
  const [dados, setDados] = useState<Semana | null>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    api<Semana>(`/agendamentos/semana/?semana=${semana}`)
      .then((resposta) => {
        setDados(resposta)
        setErro(false)
      })
      .catch(() => setErro(true))
  }, [semana])

  return (
    <section className="cartao calendario">
      <header className="calendario-topo">
        <h2>Calendário semanal</h2>
        <label className="seletor-dia">
          Semana:
          <select value={semana} onChange={(e) => setSemana(Number(e.target.value))}>
            {SEMANAS.map((s) => (
              <option key={s.valor} value={s.valor}>{s.rotulo}</option>
            ))}
          </select>
        </label>
      </header>

      {erro && <p className="mensagem mensagem-erro">Não foi possível carregar o calendário.</p>}

      {/* Os dias ficam lado a lado e rolam para o lado quando não cabem */}
      <div className="calendario-dias">
        {dados?.dias.map((dia) => (
          <button
            key={dia.data}
            type="button"
            className={`calendario-dia${dia.data === diaSelecionado ? ' selecionado' : ''}`}
            onClick={() => aoEscolherDia(dia.data)}
            title="Ver a agenda deste dia"
          >
            <div className="calendario-dia-topo">
              <strong>
                {dia.nome} <span className="calendario-data">{diaEMes(dia.data)}</span>
              </strong>
              {dia.eh_hoje && <span className="selo-hoje">hoje</span>}
            </div>
            <span className={`selo-nivel ${dia.nivel}`}>{ROTULO_DO_NIVEL[dia.nivel]}</span>
            <span className="calendario-ocupacao">
              <span className={`bolinha ${dia.nivel}`} aria-hidden="true" />
              {dia.ocupacao}%
            </span>
            <span className="calendario-descricao">{descricao(dia)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
