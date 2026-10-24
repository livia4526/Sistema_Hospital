import { useState } from 'react'
import { Link } from 'react-router-dom'
import { atualizar } from '../api/cliente'
import { useLogin } from '../auth/useLogin'
import { Cabecalho } from '../components/Cabecalho'
import type { TamanhoLetra, Tema, Usuario } from '../types'
import { aplicarPreferencias } from '../utils/preferencias'
import './Configuracoes.css'
import './Formulario.css'

const TEMAS: { valor: Tema; nome: string; descricao: string }[] = [
  { valor: 'claro', nome: 'Claro', descricao: 'Fundo claro, como o Figma' },
  { valor: 'escuro', nome: 'Escuro', descricao: 'Descansa a vista à noite' },
  { valor: 'sistema', nome: 'Igual ao computador', descricao: 'Segue o tema do Windows' },
]

const TAMANHOS: { valor: TamanhoLetra; nome: string; px: number }[] = [
  { valor: 'pequena', nome: 'Pequena', px: 14 },
  { valor: 'normal', nome: 'Normal', px: 16 },
  { valor: 'grande', nome: 'Grande', px: 18 },
  { valor: 'muito_grande', nome: 'Muito grande', px: 20 },
]

export function Configuracoes() {
  const { usuario, atualizarUsuario } = useLogin()
  const [estado, setEstado] = useState<'' | 'salvando' | 'salvo' | 'erro'>('')

  if (!usuario) return null

  // Aplica na hora (a pessoa já vê a mudança) e salva no perfil (vale em qualquer computador)
  async function escolher(mudanca: Partial<Pick<Usuario, 'tema' | 'tamanho_letra'>>) {
    if (!usuario) return
    const anterior = { tema: usuario.tema, tamanho_letra: usuario.tamanho_letra }
    aplicarPreferencias({ ...anterior, ...mudanca })
    setEstado('salvando')
    try {
      atualizarUsuario(await atualizar<Usuario>('/auth/perfil/', mudanca))
      setEstado('salvo')
    } catch {
      aplicarPreferencias(anterior) // não salvou: volta como estava
      setEstado('erro')
    }
  }

  return (
    <div className="pagina">
      <Cabecalho />
      <main className="pagina-formulario configuracoes">
        <Link to="/" className="voltar">← Voltar ao painel</Link>

        <section className="cartao-formulario tema-ficha">
          <div className="config-topo">
            <h1>Configurações</h1>
            <span className={`config-estado ${estado}`} role="status">
              {estado === 'salvando' && 'Salvando...'}
              {estado === 'salvo' && 'Salvo ✓'}
              {estado === 'erro' && 'Não foi possível salvar'}
            </span>
          </div>

          <h2 className="config-titulo">Tema</h2>
          <div className="opcoes" role="radiogroup" aria-label="Tema">
            {TEMAS.map((t) => (
              <button
                key={t.valor}
                type="button"
                role="radio"
                aria-checked={usuario.tema === t.valor}
                className={`opcao${usuario.tema === t.valor ? ' escolhida' : ''}`}
                onClick={() => escolher({ tema: t.valor })}
              >
                {/* miniatura da tela em cada tema */}
                <span className={`miniatura miniatura-${t.valor}`} aria-hidden="true">
                  <span /><span /><span />
                </span>
                <strong>{t.nome}</strong>
                <small>{t.descricao}</small>
              </button>
            ))}
          </div>

          <h2 className="config-titulo">Tamanho da letra</h2>
          <div className="opcoes" role="radiogroup" aria-label="Tamanho da letra">
            {TAMANHOS.map((t) => (
              <button
                key={t.valor}
                type="button"
                role="radio"
                aria-checked={usuario.tamanho_letra === t.valor}
                className={`opcao opcao-letra${usuario.tamanho_letra === t.valor ? ' escolhida' : ''}`}
                onClick={() => escolher({ tamanho_letra: t.valor })}
              >
                <span className="amostra-letra" style={{ fontSize: t.px * 1.6 }} aria-hidden="true">Aa</span>
                <strong>{t.nome}</strong>
              </button>
            ))}
          </div>
          <p className="config-dica">
            As escolhas ficam salvas no seu perfil e valem em qualquer computador em que você entrar.
          </p>
        </section>
      </main>
    </div>
  )
}
