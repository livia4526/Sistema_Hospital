import { ErroDaApi } from '../api/cliente'

export type ErrosDoFormulario = Record<string, string | undefined>

// O Django devolve os erros assim: { "cpf": ["Já existe..."], "non_field_errors": ["..."] }
// Esta função transforma isso em { cpf: "Já existe...", geral: "..." }
export function errosDoDjango(erro: unknown, camposDaTela: string[]): ErrosDoFormulario {
  if (!(erro instanceof ErroDaApi) || !erro.dados || typeof erro.dados !== 'object') {
    return { geral: 'Não foi possível salvar. Tente de novo.' }
  }
  const resultado: ErrosDoFormulario = {}
  for (const [campo, mensagens] of Object.entries(erro.dados)) {
    const texto = Array.isArray(mensagens) ? mensagens.join(' ') : String(mensagens)
    const chave = camposDaTela.includes(campo) ? campo : 'geral'
    resultado[chave] = resultado[chave] ? `${resultado[chave]} ${texto}` : texto
  }
  return resultado
}
