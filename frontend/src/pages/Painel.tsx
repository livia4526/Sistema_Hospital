import { useState } from 'react'
import { AgendaDoDia } from '../components/AgendaDoDia'
import { Cabecalho } from '../components/Cabecalho'
import { ResumoHoje } from '../components/ResumoHoje'
import './Painel.css'

// Tela principal depois do login. Vai ganhando os outros blocos do Figma aos poucos.
export function Painel() {
  // Um contador: cada vez que a agenda muda, ele soma 1 e o resumo se atualiza
  const [versao, setVersao] = useState(0)

  return (
    <div className="pagina">
      <Cabecalho />
      <main className="painel">
        <div className="painel-coluna">
          <ResumoHoje versao={versao} />
        </div>
        <div className="painel-coluna painel-agenda">
          <AgendaDoDia aoMudar={() => setVersao((v) => v + 1)} />
        </div>
      </main>
    </div>
  )
}
