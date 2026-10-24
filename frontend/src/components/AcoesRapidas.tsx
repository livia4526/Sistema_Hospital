import { Link } from 'react-router-dom'
import './AcoesRapidas.css'

// Os três botões do rodapé do painel
export function AcoesRapidas() {
  return (
    <div className="acoes-rapidas">
      <div className="acoes-botoes">
        <Link to="/agendar/consulta" className="acao acao-consulta">+ Nova consulta</Link>
        <Link to="/agendar/cirurgia" className="acao acao-cirurgia">+ Nova cirurgia</Link>
        <Link to="/pacientes/novo" className="acao acao-paciente">+ Novo paciente</Link>
      </div>
    </div>
  )
}
