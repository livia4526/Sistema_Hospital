// Formatos dos dados que vêm da API do Django

export type Usuario = {
  id: number
  usuario: string
  nome: string
}

export type Sessao = {
  logado: boolean
  usuario?: Usuario
}
