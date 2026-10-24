import type { TamanhoLetra, Tema } from '../types'

// Tamanho da letra base. Como o CSS usa "rem", a tela inteira cresce ou diminui junto.
const TAMANHOS: Record<TamanhoLetra, string> = {
  pequena: '14px',
  normal: '16px',
  grande: '18px',
  muito_grande: '20px',
}

const CHAVE = 'iris-preferencias'
const escuroNoComputador = window.matchMedia('(prefers-color-scheme: dark)')

type Preferencias = { tema: Tema; tamanho_letra: TamanhoLetra }

// Aplica tema e letra na página e guarda no navegador (para já abrir certo na próxima vez)
export function aplicarPreferencias({ tema, tamanho_letra }: Preferencias) {
  const raiz = document.documentElement
  const escuro = tema === 'escuro' || (tema === 'sistema' && escuroNoComputador.matches)
  raiz.dataset.tema = escuro ? 'escuro' : 'claro'
  raiz.dataset.temaEscolhido = tema
  raiz.style.setProperty('--tamanho-texto', TAMANHOS[tamanho_letra] ?? TAMANHOS.normal)
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ tema, tamanho_letra }))
  } catch {
    // navegador sem armazenamento (ex.: aba anônima bloqueada): só não guarda
  }
}

export function preferenciasGuardadas(): Preferencias {
  try {
    const texto = localStorage.getItem(CHAVE)
    if (texto) return JSON.parse(texto) as Preferencias
  } catch {
    // ignora e usa o padrão
  }
  return { tema: 'claro', tamanho_letra: 'normal' }
}

// Se o tema for "igual ao do computador", acompanha quando o computador muda de claro para escuro
escuroNoComputador.addEventListener('change', () => {
  if (document.documentElement.dataset.temaEscolhido === 'sistema') {
    aplicarPreferencias({ ...preferenciasGuardadas(), tema: 'sistema' })
  }
})
