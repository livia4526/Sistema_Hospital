import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BuscaPaciente } from '../components/BuscaPaciente'
import { Cabecalho } from '../components/Cabecalho'
import './Formulario.css'

// Tela de busca: escolher um paciente abre a ficha dele
export function BuscarPacientes() {
  const [parametros] = useSearchParams()
  const navegar = useNavigate()

  return (
    <div className="pagina">
      <Cabecalho />
      <main className="pagina-formulario">
        <Link to="/" className="voltar">← Voltar ao painel</Link>
        <BuscaPaciente
          textoInicial={parametros.get('q') ?? ''}
          aoEscolher={(paciente) => navegar(`/pacientes/${paciente.id}`)}
        />
      </main>
    </div>
  )
}
