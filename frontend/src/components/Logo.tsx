import './Logo.css'

// Marca do sistema: um olho estilizado + o nome
type Props = { comNome?: boolean; tamanho?: number }

export function Logo({ comNome = true, tamanho = 32 }: Props) {
  return (
    <span className="logo">
      <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="var(--azul)" />
        <path d="M5 16c3-5 6.5-7.5 11-7.5S24 11 27 16c-3 5-6.5 7.5-11 7.5S8 21 5 16z" fill="#fff" />
        <circle cx="16" cy="16" r="4.5" fill="var(--azul)" />
        <circle cx="17.6" cy="14.4" r="1.4" fill="#fff" />
      </svg>
      {comNome && <span className="logo-nome">Íris</span>}
    </span>
  )
}
