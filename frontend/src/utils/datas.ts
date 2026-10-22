// Funções de data usadas nas telas

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// Date -> "2026-10-22" (o formato que a API usa), no horário do computador
export function paraTextoISO(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function somarDias(data: Date, dias: number): Date {
  const nova = new Date(data)
  nova.setDate(nova.getDate() + dias)
  return nova
}

// Date -> "22 de Outubro de 2026"
export function porExtenso(data: Date): string {
  return `${data.getDate()} de ${MESES[data.getMonth()]} de ${data.getFullYear()}`
}
