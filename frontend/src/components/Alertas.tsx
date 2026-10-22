import { useEffect, useState } from 'react'
import { api } from '../api/cliente'
import type { Alerta } from '../types'
import './Alertas.css'

const ICONES: Record<Alerta['tipo'], string> = {
  cancelamento: '✕',
  confirmacao: '!',
  aniversario: '★',
}

export function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[] | null>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    api<Alerta[]>('/painel/alertas/')
      .then(setAlertas)
      .catch(() => setErro(true))
  }, [])

  return (
    <section className="cartao alertas">
      <h2>Alertas</h2>
      {erro && <p className="mensagem mensagem-erro">Não foi possível carregar os alertas.</p>}
      {alertas && alertas.length === 0 && <p className="alertas-vazio">Nenhum alerta por hoje.</p>}
      {alertas && alertas.length > 0 && (
        <ul className="alertas-lista">
          {alertas.map((alerta) => (
            <li key={alerta.mensagem} className={`alerta alerta-${alerta.tipo}`}>
              <span className="alerta-icone" aria-hidden="true">{ICONES[alerta.tipo]}</span>
              {alerta.mensagem}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
