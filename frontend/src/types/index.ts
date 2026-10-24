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
  confirmado: boolean
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

export type Cumprimento = {
  realizadas: number
  meta: number
  cumprimento: number // em %, pode passar de 100
}

export type MetasDoMes = {
  ano: number
  mes: number
  consultas: Cumprimento
  cirurgias: Cumprimento
  geral: Cumprimento
}

export type Alerta = {
  tipo: 'cancelamento' | 'confirmacao' | 'aniversario'
  mensagem: string
}

export type NivelDeOcupacao = 'tranquilo' | 'moderado' | 'cheio'

export type DiaDaSemana = {
  data: string
  nome: string
  tipo: 'consulta' | 'cirurgia' | null
  quantidade: number
  ocupacao: number // em %
  nivel: NivelDeOcupacao
  eh_hoje: boolean
}

export type Semana = {
  inicio: string
  dias: DiaDaSemana[]
}

export type Paciente = {
  id: number
  nome: string
  cpf: string
  data_nascimento: string
  idade: number
  sexo: '' | 'F' | 'M' | 'O'
  plano: string
  plano_nome: string
  plano_outro: string
  celular: string
  email: string
  informacoes_complementares: string
  consultas_realizadas: number
  ultima_consulta: string | null
  proxima_consulta: string | null
}

// Os mesmos valores do modelo Paciente no Django
export const PLANOS = [
  { valor: 'unimed', nome: 'Unimed' },
  { valor: 'hapvida', nome: 'Hapvida' },
  { valor: 'bradesco', nome: 'Bradesco' },
  { valor: 'plamed', nome: 'Plamed' },
  { valor: 'notredame', nome: 'NotreDame' },
  { valor: 'particular', nome: 'Particular' },
  { valor: 'outros', nome: 'Outros' },
]

export type HorariosLivres = {
  data: string
  tipo: string
  horarios: string[]
  aviso: string | null // motivo de não haver horários (dia de cirurgia, limite atingido...)
}

export const OLHOS = [
  { valor: 'OD', nome: 'OD - Olho direito' },
  { valor: 'OE', nome: 'OE - Olho esquerdo' },
  { valor: 'AO', nome: 'AO - Ambos os olhos' },
]

export const TIPOS_DE_CIRURGIA = [
  { valor: 'catarata', nome: 'Catarata' },
  { valor: 'miopia', nome: 'Miopia' },
  { valor: 'glaucoma', nome: 'Glaucoma' },
  { valor: 'retina', nome: 'Retina' },
  { valor: 'estrabismo', nome: 'Estrabismo' },
  { valor: 'cornea', nome: 'Córnea' },
  { valor: 'outros', nome: 'Outros' },
]
