import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useLogin } from '../auth/useLogin'
import { IconeGoogle } from '../components/IconeGoogle'
import { IconeOlho } from '../components/IconeOlho'
import { Logo } from '../components/Logo'
import './Login.css'

export function Login() {
  const { usuario, entrar } = useLogin()

  // "Estado" = valores que a tela guarda e que, quando mudam, redesenham a tela
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Já está logada? Vai direto para o painel
  if (usuario) return <Navigate to="/" replace />

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault() // impede o navegador de recarregar a página
    setErro('')
    setAviso('')
    if (!nome || !senha) {
      setErro('Preencha o usuário e a senha.')
      return
    }
    setEnviando(true)
    try {
      await entrar(nome, senha, lembrar)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pagina-login">
      <header className="barra-topo">
        <Logo />
      </header>

      <main className="area-login">
        <form className="cartao-login" onSubmit={aoEnviar} noValidate>
          <div className="cartao-login-logo">
            <Logo comNome={false} tamanho={26} />
          </div>
          <h1>Log in</h1>

          <label className="campo">
            <span>Usuário</span>
            <input
              type="text"
              placeholder="Nome"
              autoComplete="username"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>

          <label className="campo">
            <span>Senha</span>
            <div className="campo-senha">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Senha"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button
                type="button"
                className="botao-olho"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
              >
                <IconeOlho aberto={!mostrarSenha} />
              </button>
            </div>
          </label>
          <p className="dica">Deve ser uma combinação de no mínimo 8 letras, números e símbolos.</p>

          <div className="linha-opcoes">
            <label className="lembrar">
              <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
              Lembre-se de mim
            </label>
            <button
              type="button"
              className="link"
              onClick={() => setAviso('Para redefinir a senha, fale com o administrador do sistema.')}
            >
              Esqueceu a senha?
            </button>
          </div>

          {erro && <p className="mensagem mensagem-erro" role="alert">{erro}</p>}
          {aviso && <p className="mensagem mensagem-aviso">{aviso}</p>}

          <button type="submit" className="botao-principal" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Log in'}
          </button>
          <button
            type="button"
            className="botao-contorno"
            onClick={() => setAviso('O login com Google chega em uma próxima versão.')}
          >
            <IconeGoogle /> Entrar com Google
          </button>

          <hr />
          <p className="rodape-login">
            Ainda não tem uma conta?{' '}
            <button
              type="button"
              className="link"
              onClick={() => setAviso('Novas contas são criadas pelo administrador do sistema.')}
            >
              Cadastre-se
            </button>
          </p>
        </form>
      </main>
    </div>
  )
}
