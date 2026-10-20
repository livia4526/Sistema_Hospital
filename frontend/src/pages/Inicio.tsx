import { useLogin } from '../auth/useLogin'
import { Logo } from '../components/Logo'

// Página provisória: aqui vai entrar o painel (dashboard) do Figma
export function Inicio() {
  const { usuario, sair } = useLogin()

  return (
    <div className="pagina-login">
      <header className="barra-topo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo />
        <button className="link" onClick={sair}>Sair</button>
      </header>
      <main style={{ padding: 32 }}>
        <h1>Olá, {usuario?.nome}!</h1>
        <p>O painel com a agenda do dia vem aqui.</p>
      </main>
    </div>
  )
}
