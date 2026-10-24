// Funções para conversar com a API do Django.
// Toda chamada passa por aqui, então detalhes como cookies e segurança ficam num lugar só.

function lerCookie(nome: string): string {
  const item = document.cookie.split('; ').find((c) => c.startsWith(nome + '='))
  return item ? decodeURIComponent(item.split('=')[1]) : ''
}

export class ErroDaApi extends Error {
  dados: unknown
  constructor(mensagem: string, dados: unknown) {
    super(mensagem)
    this.dados = dados
  }
}

export async function api<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const ehArquivo = opcoes.body instanceof FormData
  const resposta = await fetch('/api' + caminho, {
    ...opcoes,
    credentials: 'same-origin', // envia o cookie de sessão (quem está logado)
    headers: {
      // Para arquivos (FormData), o próprio navegador define o tipo; para o resto, é JSON
      ...(ehArquivo ? {} : { 'Content-Type': 'application/json' }),
      // O Django exige este "token anti-falsificação" em tudo que altera dados
      'X-CSRFToken': lerCookie('csrftoken'),
      ...opcoes.headers,
    },
  })

  const dados = resposta.status === 204 ? null : await resposta.json()
  if (!resposta.ok) {
    const mensagem =
      (dados && typeof dados === 'object' && 'erro' in dados && String(dados.erro)) ||
      'Não foi possível concluir. Tente de novo.'
    throw new ErroDaApi(mensagem, dados)
  }
  return dados as T
}

export const enviar = (caminho: string, corpo: unknown) =>
  api(caminho, { method: 'POST', body: JSON.stringify(corpo) })

export const atualizar = <T,>(caminho: string, corpo: unknown) =>
  api<T>(caminho, { method: 'PATCH', body: JSON.stringify(corpo) })

export const apagar = <T,>(caminho: string) => api<T>(caminho, { method: 'DELETE' })

// Envia um arquivo (ex.: foto) no campo indicado
export function enviarArquivo<T>(caminho: string, campo: string, arquivo: File) {
  const formulario = new FormData()
  formulario.append(campo, arquivo)
  return api<T>(caminho, { method: 'POST', body: formulario })
}
