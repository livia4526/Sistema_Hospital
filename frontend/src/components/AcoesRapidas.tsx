import { useState } from 'react'
import { Link } from 'react-router-dom'
import './AcoesRapidas.css'

// Os três botões do rodapé do painel
export function AcoesRapidas() {
  const [aviso, setAviso] = useState('')
  const emBreve = () => setAviso('As telas de Nova consulta e Nova cirurgia são a próxima etapa do projeto.')

  return (
    <div className="acoes-rapidas">
      <div className="acoes-botoes">
        <button type="button" className="acao acao-consulta" onClick={emBreve}>+ Nova consulta</button>
        <button type="button" className="acao acao-cirurgia" onClick={emBreve}>+ Nova cirurgia</button>
        <Link to="/pacientes/novo" className="acao acao-paciente">+ Novo paciente</Link>
      </div>
      {aviso && <p className="mensagem mensagem-aviso">{aviso}</p>}
    </div>
  )
}
