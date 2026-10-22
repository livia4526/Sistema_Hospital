import { AgendaDoDia } from '../components/AgendaDoDia'
import { Cabecalho } from '../components/Cabecalho'
import './Painel.css'

// Tela principal depois do login. Vai ganhando os outros blocos do Figma aos poucos.
export function Painel() {
  return (
    <div className="pagina">
      <Cabecalho />
      <main className="painel">
        <AgendaDoDia />
      </main>
    </div>
  )
}
