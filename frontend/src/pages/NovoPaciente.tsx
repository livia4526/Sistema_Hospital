import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { enviar } from '../api/cliente'
import { Cabecalho } from '../components/Cabecalho'
import { CamposPaciente } from '../components/CamposPaciente'
import type { Paciente } from '../types'
import { errosDoDjango } from '../utils/erros'
import {
  CAMPOS_VAZIOS, paraEnviar, validarPaciente, type CamposDoPaciente, type ErrosDoPaciente,
} from '../utils/paciente'
import './Formulario.css'

export function NovoPaciente() {
  // Quando vem do agendamento ("O paciente possui cadastro? Não"), o endereço traz ?voltar=/agendar/consulta
  const [parametros] = useSearchParams()
  const pedido = parametros.get('voltar') ?? ''
  const voltar = pedido.startsWith('/agendar/') ? pedido : null // só aceita voltar para telas de agendamento

  const [campos, setCampos] = useState<CamposDoPaciente>(CAMPOS_VAZIOS)
  const [erros, setErros] = useState<ErrosDoPaciente>({})
  const [enviando, setEnviando] = useState(false)
  const [cadastrado, setCadastrado] = useState<Paciente | null>(null)

  // Atualiza um campo só, mantendo os outros
  function mudar(campo: keyof CamposDoPaciente, valor: string) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: undefined }))
  }

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    const encontrados = validarPaciente(campos)
    if (Object.keys(encontrados).length) {
      setErros(encontrados)
      return
    }
    setEnviando(true)
    try {
      setCadastrado((await enviar('/pacientes/', paraEnviar(campos))) as Paciente)
      setCampos(CAMPOS_VAZIOS)
    } catch (e) {
      setErros(errosDoDjango(e, Object.keys(CAMPOS_VAZIOS)) as ErrosDoPaciente)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pagina">
      <Cabecalho />
      <main className="pagina-formulario">
        <Link to="/" className="voltar">← Voltar ao painel</Link>

        {cadastrado ? (
          <section className="cartao-formulario tema-paciente sucesso">
            <h1>Paciente cadastrado!</h1>
            <p>O cadastro de {cadastrado.nome} foi concluído.</p>
            <div className="botoes-sucesso">
              {voltar && (
                <Link
                  to={`${voltar}${voltar.includes('?') ? '&' : '?'}paciente=${cadastrado.id}`}
                  className="botao-formulario"
                >
                  Continuar o agendamento
                </Link>
              )}
              <Link to={`/pacientes/${cadastrado.id}`} className="botao-formulario contorno">Ver ficha</Link>
              <button type="button" className="botao-formulario contorno" onClick={() => setCadastrado(null)}>
                Cadastrar outro paciente
              </button>
            </div>
          </section>
        ) : (
          <form className="cartao-formulario tema-paciente" onSubmit={aoEnviar} noValidate>
            <h1>Novo paciente</h1>
            <CamposPaciente campos={campos} erros={erros} mudar={mudar} />
            {erros.geral && <p className="mensagem mensagem-erro">{erros.geral}</p>}
            <div className="rodape-formulario">
              <button type="submit" className="botao-formulario" disabled={enviando}>
                {enviando ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
