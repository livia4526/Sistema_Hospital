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

export type StatusAgendamento = 'agendada' | 'realizada' | 'falta' | 'remarcada' | 'cancelada'

export type Agendamento = {
  id: number
  paciente: number
  paciente_nome: string
  tipo: 'consulta' | 'cirurgia'
  tipo_nome: string
  data: string // "2026-10-22"
  horario: string // "09:00"
  status: StatusAgendamento
  status_nome: string
  encaixe: boolean
  motivo: string
  olho: string
  tipo_cirurgia: string
  precaucoes: string
  observacao: string
}

export type ResumoDoDia = {
  data: string
  total: number
  compareceram: number
  faltaram: number
  pendentes: number
}
