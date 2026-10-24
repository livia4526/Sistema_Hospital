import { soNumeros } from './mascaras'

// Campos do cadastro do paciente. Usados no "Novo paciente" e na ficha (para editar).
export const CAMPOS_VAZIOS = {
  nome: '',
  data_nascimento: '',
  sexo: '',
  plano: 'particular',
  plano_outro: '',
  celular: '',
  email: '',
  cpf: '',
  informacoes_complementares: '',
}

export type CamposDoPaciente = typeof CAMPOS_VAZIOS
export type ErrosDoPaciente = Partial<Record<keyof CamposDoPaciente | 'geral', string>>

// Confere o básico antes de enviar; o Django confere tudo de novo (CPF repetido, etc.)
export function validarPaciente(campos: CamposDoPaciente): ErrosDoPaciente {
  const erros: ErrosDoPaciente = {}
  if (!campos.nome.trim()) erros.nome = 'Informe o nome.'
  if (!campos.data_nascimento) erros.data_nascimento = 'Informe a data de nascimento.'
  if (soNumeros(campos.celular).length < 10) erros.celular = 'Informe o celular com DDD.'
  if (soNumeros(campos.cpf).length !== 11) erros.cpf = 'O CPF deve ter 11 números.'
  if (campos.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(campos.email)) erros.email = 'E-mail inválido.'
  if (campos.plano === 'outros' && !campos.plano_outro.trim()) erros.plano_outro = 'Informe qual é o plano.'
  return erros
}

// O que vai para a API: CPF e celular só com números
export function paraEnviar(campos: CamposDoPaciente) {
  return { ...campos, cpf: soNumeros(campos.cpf), celular: soNumeros(campos.celular) }
}
