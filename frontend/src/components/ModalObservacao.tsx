import { useEffect, useState } from 'react'
import type { Agendamento } from '../types'
import './ModalObservacao.css'

type Props = {
  agendamento: Agendamento
  aoFechar: () => void
  aoSalvar: (texto: string) => Promise<void>
}

// Janela para escrever a observação de um atendimento
export function ModalObservacao({ agendamento, aoFechar, aoSalvar }: Props) {
  const [texto, setTexto] = useState(agendamento.observacao)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Fecha com a tecla Esc
  useEffect(() => {
    const aoApertar = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', aoApertar)
    return () => window.removeEventListener('keydown', aoApertar)
  }, [aoFechar])

  async function salvar() {
    setSalvando(true)
    setErro('')
    try {
      await aoSalvar(texto)
      aoFechar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.')
      setSalvando(false)
    }
  }

  return (
    <div className="fundo-modal" onClick={aoFechar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-obs"
        onClick={(e) => e.stopPropagation()} // clique dentro não fecha
      >
        <h2 id="titulo-obs">Observação</h2>
        <p className="modal-sub">
          {agendamento.paciente_nome} · {agendamento.horario} · {agendamento.tipo_nome}
        </p>
        <textarea
          autoFocus
          rows={5}
          placeholder="Ex.: o doutor pediu para trazer os exames na próxima consulta"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        {erro && <p className="mensagem mensagem-erro">{erro}</p>}
        <div className="modal-botoes">
          <button type="button" className="botao-secundario" onClick={aoFechar}>Cancelar</button>
          <button type="button" className="botao-salvar" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
