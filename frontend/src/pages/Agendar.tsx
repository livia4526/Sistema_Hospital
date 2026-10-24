import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api/cliente'
import { BuscaPaciente } from '../components/BuscaPaciente'
import { Cabecalho } from '../components/Cabecalho'
import { FormularioAgendamento } from '../components/FormularioAgendamento'
import { PerguntaCadastro } from '../components/PerguntaCadastro'
import type { Agendamento, Paciente } from '../types'
import { deTextoISO, porExtenso } from '../utils/datas'
import './Agendar.css'
import './Formulario.css'

type Passo = 'pergunta' | 'busca' | 'formulario' | 'pronto'

// Fluxo do PDF: possui cadastro? -> busca (ou cadastro novo) -> formulário -> pronto
export function Agendar() {
  const { tipo: tipoNoEndereco } = useParams()
  const tipo = tipoNoEndereco === 'cirurgia' ? 'cirurgia' : 'consulta'
  const [parametros] = useSearchParams()
  const encaixe = tipo === 'consulta' && parametros.get('encaixe') === '1'
  const idDoPaciente = parametros.get('paciente') // vem preenchido depois de cadastrar um paciente novo
  const navegar = useNavigate()

  const [passo, setPasso] = useState<Passo>(idDoPaciente ? 'formulario' : 'pergunta')
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [agendado, setAgendado] = useState<Agendamento | null>(null)

  useEffect(() => {
    if (!idDoPaciente) return
    api<Paciente>(`/pacientes/${idDoPaciente}/`)
      .then(setPaciente)
      .catch(() => setPasso('pergunta'))
  }, [idDoPaciente])

  const enderecoDeVolta = `/agendar/${tipo}${encaixe ? '?encaixe=1' : ''}`
  const nomeDoTipo = encaixe ? 'encaixe' : tipo

  function responder(temCadastro: boolean) {
    if (temCadastro) setPasso('busca')
    // Sem cadastro: vai para o Novo paciente e, depois de cadastrar, volta para cá
    else navegar(`/pacientes/novo?voltar=${encodeURIComponent(enderecoDeVolta)}`)
  }

  function escolher(escolhido: Paciente) {
    setPaciente(escolhido)
    setPasso('formulario')
  }

  return (
    <div className="pagina">
      <Cabecalho />
      <main className="pagina-formulario">
        <Link to="/" className="voltar">← Voltar ao painel</Link>

        {passo === 'pergunta' && <PerguntaCadastro aoResponder={responder} />}

        {passo === 'busca' && (
          <>
            <h1 className="titulo-passo">Para qual paciente é {encaixe ? 'o encaixe' : `a ${nomeDoTipo}`}?</h1>
            <BuscaPaciente aoEscolher={escolher} />
          </>
        )}

        {passo === 'formulario' && paciente && (
          <FormularioAgendamento
            tipo={tipo}
            paciente={paciente}
            encaixe={encaixe}
            aoTrocarPaciente={() => setPasso('busca')}
            aoAgendar={(novo) => {
              setAgendado(novo)
              setPasso('pronto')
            }}
          />
        )}

        {passo === 'pronto' && agendado && (
          <section className={`cartao-formulario ${tipo === 'cirurgia' ? 'tema-cirurgia' : 'tema-consulta'} sucesso`}>
            <h1>{tipo === 'cirurgia' ? 'Cirurgia agendada!' : encaixe ? 'Encaixe feito!' : 'Consulta agendada!'}</h1>
            <p>
              {agendado.paciente_nome} · {porExtenso(deTextoISO(agendado.data))} às {agendado.horario}
            </p>
            <div className="botoes-sucesso">
              <Link to="/" className="botao-formulario">Voltar ao painel</Link>
              <a href={enderecoDeVolta} className="botao-formulario contorno">
                Agendar {encaixe ? 'outro encaixe' : `outra ${tipo}`}
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
