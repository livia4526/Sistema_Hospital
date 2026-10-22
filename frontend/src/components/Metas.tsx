import { useEffect, useState } from 'react'
import { api } from '../api/cliente'
import type { MetasDoMes } from '../types'
import './Metas.css'

// Cor de acordo com o desempenho: verde bateu a meta, amarelo está perto, vermelho está longe
function corDoDesempenho(porcentagem: number) {
  if (porcentagem >= 100) return 'bom'
  if (porcentagem >= 70) return 'perto'
  return 'longe'
}

// 99.5 -> "99,5%"   78 -> "78%"
function formatar(porcentagem: number) {
  return porcentagem.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'
}

export function Metas({ versao }: { versao: number }) {
  const [metas, setMetas] = useState<MetasDoMes | null>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    api<MetasDoMes>('/painel/metas/')
      .then((dados) => {
        setMetas(dados)
        setErro(false)
      })
      .catch(() => setErro(true))
  }, [versao])

  if (erro) return <p className="mensagem mensagem-erro">Não foi possível carregar as metas.</p>
  if (!metas) return null

  const itens = [
    {
      rotulo: 'Consultas realizadas',
      destaque: `${metas.consultas.realizadas}/${metas.consultas.meta}`,
      detalhe: formatar(metas.consultas.cumprimento),
      porcentagem: metas.consultas.cumprimento,
    },
    {
      rotulo: 'Cirurgias realizadas',
      destaque: `${metas.cirurgias.realizadas}/${metas.cirurgias.meta}`,
      detalhe: formatar(metas.cirurgias.cumprimento),
      porcentagem: metas.cirurgias.cumprimento,
    },
    {
      rotulo: 'Cumprimento geral',
      destaque: formatar(metas.geral.cumprimento),
      detalhe: `${metas.geral.realizadas}/${metas.geral.meta}`,
      porcentagem: metas.geral.cumprimento,
    },
  ]

  return (
    <section className="metas">
      <h2>Metas:</h2>
      <div className="metas-itens">
        {itens.map((item) => (
          <div key={item.rotulo} className={`metas-item ${corDoDesempenho(item.porcentagem)}`}>
            <strong className="metas-valor">{item.destaque}</strong>
            <div className="metas-barra" aria-hidden="true">
              {/* a barra para em 100%, mesmo que a meta tenha sido superada */}
              <div style={{ width: `${Math.min(item.porcentagem, 100)}%` }} />
            </div>
            <span className="metas-rotulo">{item.rotulo}</span>
            <span className="metas-detalhe">{item.detalhe}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
