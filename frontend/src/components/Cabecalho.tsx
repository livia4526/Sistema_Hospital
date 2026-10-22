import { useLogin } from '../auth/useLogin'
import { Logo } from './Logo'
import './Cabecalho.css'

// Barra do topo, igual em todas as telas depois do login
export function Cabecalho() {
  const { usuario, sair } = useLogin()

  return (
    <header className="cabecalho">
      <Logo />
      <div className="cabecalho-usuario">
        <span>Olá, {usuario?.nome}</span>
        <button type="button" className="link" onClick={sair}>Sair</button>
      </div>
    </header>
  )
}
