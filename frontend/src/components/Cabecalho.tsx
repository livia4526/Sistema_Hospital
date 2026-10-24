import { Link } from 'react-router-dom'
import { useLogin } from '../auth/useLogin'
import { Avatar } from './Avatar'
import { Logo } from './Logo'
import './Cabecalho.css'

// Barra do topo, igual em todas as telas depois do login
export function Cabecalho() {
  const { usuario, sair } = useLogin()

  return (
    <header className="cabecalho">
      <Link to="/" aria-label="Ir para o painel" className="cabecalho-logo">
        <Logo />
      </Link>
      <div className="cabecalho-usuario">
        <Link to="/configuracoes" className="icone-topo" aria-label="Configurações" title="Configurações">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.5 1a7.3 7.3 0 0 0-1.7-1l-.4-2.6a.5.5 0 0 0-.5-.4h-4a.5.5 0 0 0-.5.4l-.4 2.6a7.3 7.3 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.6.2l-2 3.5a.5.5 0 0 0 .1.6L4.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6a.5.5 0 0 0-.1.6l2 3.5c.1.2.4.3.6.2l2.5-1c.5.4 1.1.7 1.7 1l.4 2.6c0 .2.2.4.5.4h4c.3 0 .5-.2.5-.4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.5 1c.2.1.5 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6L19.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
          </svg>
        </Link>
        {usuario && (
          <Link to="/perfil" className="cabecalho-perfil" title="Meu perfil">
            <Avatar usuario={usuario} tamanho={32} />
            <span className="cabecalho-nome">{usuario.nome}</span>
          </Link>
        )}
        <button type="button" className="link" onClick={sair}>Sair</button>
      </div>
    </header>
  )
}
