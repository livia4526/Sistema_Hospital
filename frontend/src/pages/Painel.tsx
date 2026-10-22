import { useRef, useState } from 'react'
import { AgendaDoDia } from '../components/AgendaDoDia'
import { Alertas } from '../components/Alertas'
import { Cabecalho } from '../components/Cabecalho'
import { CalendarioSemanal } from '../components/CalendarioSemanal'
import { Metas } from '../components/Metas'
import { ResumoHoje } from '../components/ResumoHoje'
import { paraTextoISO } from '../utils/datas'
import './Painel.css'

// Tela principal depois do login
export function Painel() {
  // Um contador: cada vez que a agenda muda, ele soma 1 e o resumo e as metas se atualizam
  const [versao, setVersao] = useState(0)
  // O dia que a agenda está mostrando (começa em hoje)
  const [diaDaAgenda, setDiaDaAgenda] = useState(paraTextoISO(new Date()))
  const areaDaAgenda = useRef<HTMLDivElement>(null)

  function verDiaNoCalendario(dataISO: string) {
    setDiaDaAgenda(dataISO)
    // leva a tela até a agenda (útil no celular, onde ela fica longe do calendário)
    areaDaAgenda.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pagina">
      <Cabecalho />
      <main className="painel">
        <div className="painel-coluna">
          <section className="cartao">
            <ResumoHoje versao={versao} />
            <Metas versao={versao} />
          </section>
          <Alertas />
        </div>
        <div className="painel-coluna painel-agenda" ref={areaDaAgenda}>
          <AgendaDoDia
            key={diaDaAgenda} // trocar o dia "recria" a agenda, já carregando o dia novo
            dataISO={diaDaAgenda}
            aoTrocarData={setDiaDaAgenda}
            aoMudar={() => setVersao((v) => v + 1)}
          />
        </div>
        <div className="painel-largura-toda">
          <CalendarioSemanal diaSelecionado={diaDaAgenda} aoEscolherDia={verDiaNoCalendario} />
        </div>
      </main>
    </div>
  )
}
