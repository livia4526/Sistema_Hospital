// Ícone do botão de mostrar/esconder a senha
export function IconeOlho({ aberto }: { aberto: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {!aberto && <path d="M4 4l16 16" />}
    </svg>
  )
}
