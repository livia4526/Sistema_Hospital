import { useEffect, useState } from 'react'
import { api } from '../api/cliente'
import type { ResumoDoDia } from '../types'
import { paraTextoISO } from '../utils/datas'
import './ResumoHoje.css'

// "versao" muda toda vez que a agenda muda; aí o resumo busca os números de novo
export function ResumoHoje({ versao }: { versao: number }) {
  const [resumo, setResumo] = useState<ResumoDoDia | null>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    api<ResumoDoDia>(`/agendamentos/resumo/?data=${paraTextoISO(new Date())}`)
      .then((dados) => {
        setResumo(dados)
        setErro(false)
      })
      .catch(() => setErro(true))
  }, [versao])

  const numeros = [
    { rotulo: 'Total', valor: resumo?.total, detalhe: 'Pacientes' },
    { rotulo: 'Compareceram', valor: resumo?.compareceram },
    { rotulo: 'Faltaram', valor: resumo?.faltaram },
    { rotulo: 'Pendentes', valor: resumo?.pendentes },
  ]

  return (
    <section className="resumo">
      <h2>Hoje:</h2>
      {erro ? (
        <p className="mensagem mensagem-erro">Não foi possível carregar o resumo.</p>
      ) : (
        <div className="resumo-numeros">
          {numeros.map((n) => (
            <div key={n.rotulo} className="resumo-item">
              <span className="resumo-rotulo">{n.rotulo}</span>
              <strong className="resumo-valor">{n.valor ?? '–'}</strong>
              {n.detalhe && <span className="resumo-detalhe">{n.detalhe}</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
