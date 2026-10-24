import { useEffect, useState } from 'react'
import { api } from '../api/cliente'
import type { Paciente } from '../types'
import { mascaraCPF, mascaraCelular } from '../utils/mascaras'
import './BuscaPaciente.css'

type Props = {
  aoEscolher: (paciente: Paciente) => void
}

// Caixa de busca por nome ou CPF + lista de resultados em cartões
export function BuscaPaciente({ aoEscolher }: Props) {
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState<Paciente[] | null>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    const termo = texto.trim()
    if (termo.length < 2) return
    // Espera a pessoa parar de digitar por 300 ms antes de buscar (evita uma busca por letra)
    const espera = setTimeout(() => {
      api<Paciente[]>(`/pacientes/?search=${encodeURIComponent(termo.replace(/[.-]/g, ''))}`)
        .then((lista) => {
          setResultados(lista)
          setErro(false)
        })
        .catch(() => setErro(true))
    }, 300)
    return () => clearTimeout(espera)
  }, [texto])

  const mostrar = texto.trim().length >= 2

  return (
    <div className="busca">
      <label className="busca-caixa">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          autoFocus
          placeholder="Pesquisar paciente por nome ou CPF..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-label="Pesquisar paciente"
        />
      </label>

      {erro && <p className="mensagem mensagem-erro">Não foi possível buscar agora.</p>}
      {mostrar && resultados?.length === 0 && (
        <p className="busca-vazia">Nenhum paciente encontrado com “{texto.trim()}”.</p>
      )}

      {mostrar && (
        <ul className="busca-resultados">
          {resultados?.map((p) => (
            <li key={p.id}>
              <button type="button" className="cartao-paciente" onClick={() => aoEscolher(p)}>
                <strong>{p.nome}</strong>
                <span className="chips">
                  <span className="chip">CPF: {mascaraCPF(p.cpf)}</span>
                  <span className="chip">{mascaraCelular(p.celular)}</span>
                  <span className="chip">Plano: {p.plano === 'outros' ? p.plano_outro : p.plano_nome}</span>
                  <span className="chip">{p.idade} anos</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
