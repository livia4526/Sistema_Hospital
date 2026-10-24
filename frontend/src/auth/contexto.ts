import { createContext } from 'react'
import type { Usuario } from '../types'

export type ContextoDeLogin = {
  usuario: Usuario | null
  carregando: boolean
  entrar: (usuario: string, senha: string, lembrar: boolean) => Promise<void>
  sair: () => Promise<void>
  atualizarUsuario: (usuario: Usuario) => void // depois de salvar o perfil ou as configurações
}

export const ContextoLogin = createContext<ContextoDeLogin | null>(null)
