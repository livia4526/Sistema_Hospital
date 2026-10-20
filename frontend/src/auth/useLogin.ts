import { useContext } from 'react'
import { ContextoLogin } from './contexto'

// Qualquer tela chama useLogin() para saber quem está logado, entrar ou sair
export function useLogin() {
  const contexto = useContext(ContextoLogin)
  if (!contexto) throw new Error('useLogin precisa estar dentro de <ProvedorDeLogin>')
  return contexto
}
