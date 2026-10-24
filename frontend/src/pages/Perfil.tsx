import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { apagar, atualizar, enviar, enviarArquivo } from '../api/cliente'
import { useLogin } from '../auth/useLogin'
import { Avatar } from '../components/Avatar'
import { Cabecalho } from '../components/Cabecalho'
import type { Usuario } from '../types'
import { errosDoDjango, type ErrosDoFormulario } from '../utils/erros'
import { mascaraCelular } from '../utils/mascaras'
import './Formulario.css'
import './Perfil.css'

export function Perfil() {
  const { usuario, atualizarUsuario } = useLogin()
  const entradaDeFoto = useRef<HTMLInputElement>(null)

  const [dados, setDados] = useState({
    primeiro_nome: usuario?.primeiro_nome ?? '',
    sobrenome: usuario?.sobrenome ?? '',
    email: usuario?.email ?? '',
    cargo: usuario?.cargo ?? '',
    telefone: mascaraCelular(usuario?.telefone ?? ''),
  })
  const [erros, setErros] = useState<ErrosDoFormulario>({})
  const [aviso, setAviso] = useState('')
  const [salvando, setSalvando] = useState(false)

  const [senhas, setSenhas] = useState({ atual: '', nova: '', confirmar: '' })
  const [errosSenha, setErrosSenha] = useState<ErrosDoFormulario>({})
  const [avisoSenha, setAvisoSenha] = useState('')

  if (!usuario) return null

  function mudar(campo: keyof typeof dados, valor: string) {
    setDados((atuais) => ({ ...atuais, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: undefined }))
    setAviso('')
  }

  async function salvarDados(evento: FormEvent) {
    evento.preventDefault()
    setSalvando(true)
    try {
      atualizarUsuario(await atualizar<Usuario>('/auth/perfil/', dados))
      setAviso('Perfil atualizado.')
    } catch (e) {
      setErros(errosDoDjango(e, Object.keys(dados)))
    } finally {
      setSalvando(false)
    }
  }

  async function trocarFoto(arquivo: File | undefined) {
    if (!arquivo) return
    setErros({})
    try {
      atualizarUsuario(await enviarArquivo<Usuario>('/auth/perfil/foto/', 'foto', arquivo))
    } catch (e) {
      setErros(errosDoDjango(e, ['foto']))
    }
  }

  async function removerFoto() {
    atualizarUsuario(await apagar<Usuario>('/auth/perfil/foto/'))
  }

  async function trocarSenha(evento: FormEvent) {
    evento.preventDefault()
    setAvisoSenha('')
    if (senhas.nova !== senhas.confirmar) {
      setErrosSenha({ confirmar: 'As duas senhas novas não são iguais.' })
      return
    }
    try {
      await enviar('/auth/senha/', { atual: senhas.atual, nova: senhas.nova })
      setSenhas({ atual: '', nova: '', confirmar: '' })
      setErrosSenha({})
      setAvisoSenha('Senha alterada.')
    } catch (e) {
      setErrosSenha(errosDoDjango(e, ['atual', 'nova']))
    }
  }

  const erro = (lista: ErrosDoFormulario, campo: string) =>
    lista[campo] ? <span className="erro-campo">{lista[campo]}</span> : null

  return (
    <div className="pagina">
      <Cabecalho />
      <main className="pagina-formulario perfil">
        <Link to="/" className="voltar">← Voltar ao painel</Link>

        <form className="cartao-formulario tema-ficha" onSubmit={salvarDados} noValidate>
          <div className="perfil-topo">
            <Avatar usuario={usuario} tamanho={96} />
            <div>
              <h1>{usuario.nome}</h1>
              <p className="perfil-cargo">{usuario.cargo || 'Sem cargo informado'} · usuário: {usuario.usuario}</p>
              <div className="perfil-foto-botoes">
                <button type="button" className="botao-pequeno" onClick={() => entradaDeFoto.current?.click()}>
                  {usuario.foto ? 'Trocar foto' : 'Adicionar foto'}
                </button>
                {usuario.foto && (
                  <button type="button" className="botao-pequeno contorno" onClick={removerFoto}>Remover foto</button>
                )}
                {/* o seletor de arquivo fica escondido; o botão acima abre ele */}
                <input
                  ref={entradaDeFoto}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => trocarFoto(e.target.files?.[0])}
                />
              </div>
              {erro(erros, 'foto')}
            </div>
          </div>

          <div className="grade">
            <label className="campo-form largura-2">
              <span>Nome</span>
              <input value={dados.primeiro_nome} onChange={(e) => mudar('primeiro_nome', e.target.value)} />
            </label>
            <label className="campo-form largura-2">
              <span>Sobrenome</span>
              <input value={dados.sobrenome} onChange={(e) => mudar('sobrenome', e.target.value)} />
            </label>
            <label className="campo-form largura-2">
              <span>E-mail</span>
              <input type="email" value={dados.email} onChange={(e) => mudar('email', e.target.value)} />
              {erro(erros, 'email')}
            </label>
            <label className="campo-form">
              <span>Cargo</span>
              <input value={dados.cargo} onChange={(e) => mudar('cargo', e.target.value)} />
            </label>
            <label className="campo-form">
              <span>Telefone</span>
              <input
                inputMode="numeric"
                placeholder="(79) 99999-9999"
                value={dados.telefone}
                onChange={(e) => mudar('telefone', mascaraCelular(e.target.value))}
              />
            </label>
          </div>

          {erros.geral && <p className="mensagem mensagem-erro">{erros.geral}</p>}
          {aviso && <p className="mensagem mensagem-aviso">{aviso}</p>}
          <div className="rodape-formulario">
            <button type="submit" className="botao-formulario" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>

        <form className="cartao-formulario tema-ficha" onSubmit={trocarSenha} noValidate>
          <h2 className="perfil-subtitulo">Trocar senha</h2>
          <div className="grade">
            <label className="campo-form largura-2">
              <span>Senha atual</span>
              <input
                type="password"
                autoComplete="current-password"
                value={senhas.atual}
                onChange={(e) => setSenhas({ ...senhas, atual: e.target.value })}
              />
              {erro(errosSenha, 'atual')}
            </label>
            <span className="largura-2 esconder-celular" />
            <label className="campo-form largura-2">
              <span>Nova senha</span>
              <input
                type="password"
                autoComplete="new-password"
                value={senhas.nova}
                onChange={(e) => setSenhas({ ...senhas, nova: e.target.value })}
              />
              {erro(errosSenha, 'nova')}
            </label>
            <label className="campo-form largura-2">
              <span>Repita a nova senha</span>
              <input
                type="password"
                autoComplete="new-password"
                value={senhas.confirmar}
                onChange={(e) => setSenhas({ ...senhas, confirmar: e.target.value })}
              />
              {erro(errosSenha, 'confirmar')}
            </label>
          </div>
          {errosSenha.geral && <p className="mensagem mensagem-erro">{errosSenha.geral}</p>}
          {avisoSenha && <p className="mensagem mensagem-aviso">{avisoSenha}</p>}
          <div className="rodape-formulario">
            <button type="submit" className="botao-formulario">Trocar senha</button>
          </div>
        </form>
      </main>
    </div>
  )
}
