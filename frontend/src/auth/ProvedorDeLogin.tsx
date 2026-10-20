import { useEffect, useState, type ReactNode } from 'react'
import { api, enviar } from '../api/cliente'
import type { Sessao, Usuario } from '../types'
import { ContextoLogin } from './contexto'

// Guarda "quem está logado" e deixa essa informação disponível para o app inteiro
export function ProvedorDeLogin({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  // Ao abrir o site, pergunta ao Django se já existe alguém logado
  useEffect(() => {
    api<Sessao>('/auth/sessao/')
      .then((sessao) => setUsuario(sessao.usuario ?? null))
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false))
  }, [])

  async function entrar(nomeDeUsuario: string, senha: string, lembrar: boolean) {
    const sessao = (await enviar('/auth/entrar/', {
      usuario: nomeDeUsuario,
      senha,
      lembrar,
    })) as Sessao
    setUsuario(sessao.usuario ?? null)
  }

  async function sair() {
    await enviar('/auth/sair/', {})
    setUsuario(null)
  }

  return (
    <ContextoLogin.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </ContextoLogin.Provider>
  )
}
