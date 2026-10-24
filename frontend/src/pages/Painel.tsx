import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AcoesRapidas } from '../components/AcoesRapidas'
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
  const [busca, setBusca] = useState('')
  const navegar = useNavigate()

  function buscar(evento: FormEvent) {
    evento.preventDefault()
    navegar(`/pacientes?q=${encodeURIComponent(busca.trim())}`)
  }

  function verDiaNoCalendario(dataISO: string) {
    setDiaDaAgenda(dataISO)
    // leva a tela até a agenda (útil no celular, onde ela fica longe do calendário)
    areaDaAgenda.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pagina">
      <Cabecalho />
      <main className="painel">
        <form className="painel-largura-toda painel-busca" onSubmit={buscar} role="search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            placeholder="Pesquisar paciente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Pesquisar paciente"
          />
        </form>
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
        <div className="painel-largura-toda">
          <AcoesRapidas />
        </div>
      </main>
    </div>
  )
}
