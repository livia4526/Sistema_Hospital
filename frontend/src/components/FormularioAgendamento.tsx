import { useEffect, useState, type FormEvent } from 'react'
import { api, enviar } from '../api/cliente'
import { OLHOS, TIPOS_DE_CIRURGIA, type Agendamento, type HorariosLivres, type Paciente } from '../types'
import { paraTextoISO } from '../utils/datas'
import { errosDoDjango, type ErrosDoFormulario } from '../utils/erros'
import { mascaraCelular } from '../utils/mascaras'

type Props = {
  tipo: 'consulta' | 'cirurgia'
  paciente: Paciente
  encaixe: boolean // encaixe = consulta de última hora, sempre para hoje
  aoTrocarPaciente: () => void
  aoAgendar: (agendamento: Agendamento) => void
}

export function FormularioAgendamento({ tipo, paciente, encaixe, aoTrocarPaciente, aoAgendar }: Props) {
  const hoje = paraTextoISO(new Date())
  const ehCirurgia = tipo === 'cirurgia'

  const [data, setData] = useState(encaixe ? hoje : '')
  const [horario, setHorario] = useState('')
  const [livres, setLivres] = useState<HorariosLivres | null>(null)
  const [motivo, setMotivo] = useState('')
  const [observacao, setObservacao] = useState('')
  const [olho, setOlho] = useState('OD')
  const [tipoCirurgia, setTipoCirurgia] = useState('catarata')
  const [precaucoes, setPrecaucoes] = useState('')
  const [erros, setErros] = useState<ErrosDoFormulario>({})
  const [enviando, setEnviando] = useState(false)

  // Cada vez que a data muda, busca os horários livres daquele dia
  useEffect(() => {
    if (!data) return
    let cancelado = false
    api<HorariosLivres>(`/agendamentos/horarios-livres/?data=${data}&tipo=${tipo}${encaixe ? '&encaixe=1' : ''}`)
      .then((resposta) => !cancelado && setLivres(resposta))
      .catch(() => !cancelado && setErros({ geral: 'Não foi possível buscar os horários.' }))
    return () => {
      cancelado = true
    }
  }, [data, tipo, encaixe])

  function trocarData(nova: string) {
    setData(nova)
    setHorario('') // o horário escolhido pode não existir no dia novo
    setLivres(null)
    setErros({})
  }

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    const faltando: ErrosDoFormulario = {}
    if (!data) faltando.data = 'Escolha a data primeiro.'
    if (!horario) faltando.horario = 'Escolha um horário.'
    if (Object.keys(faltando).length) {
      setErros(faltando)
      return
    }

    setEnviando(true)
    try {
      const corpo = {
        paciente: paciente.id,
        tipo,
        data,
        horario,
        encaixe,
        observacao,
        ...(ehCirurgia ? { olho, tipo_cirurgia: tipoCirurgia, precaucoes } : { motivo }),
      }
      aoAgendar((await enviar('/agendamentos/', corpo)) as Agendamento)
    } catch (e) {
      setErros(errosDoDjango(e, ['data', 'horario', 'olho', 'tipo_cirurgia', 'motivo']))
      setEnviando(false)
    }
  }

  const erro = (campo: string) => (erros[campo] ? <span className="erro-campo">{erros[campo]}</span> : null)
  const plano = paciente.plano === 'outros' ? paciente.plano_outro : paciente.plano_nome

  return (
    <form className={`cartao-formulario ${ehCirurgia ? 'tema-cirurgia' : 'tema-consulta'}`} onSubmit={aoEnviar} noValidate>
      <h1>{encaixe ? 'Encaixe' : ehCirurgia ? 'Nova cirurgia' : 'Nova consulta'}</h1>

      <div className="grade">
        {/* Dados do paciente: vêm do cadastro, só para conferir */}
        <label className="campo-form largura-3">
          <span>Nome</span>
          <input value={paciente.nome} readOnly />
        </label>
        <label className="campo-form">
          <span>Celular</span>
          <input value={mascaraCelular(paciente.celular)} readOnly />
        </label>

        <label className="campo-form">
          <span>Data</span>
          <input
            type="date"
            min={hoje}
            value={data}
            disabled={encaixe} // encaixe é sempre hoje
            onChange={(e) => trocarData(e.target.value)}
          />
          {erro('data')}
        </label>

        <label className="campo-form">
          <span>Horário</span>
          <select value={horario} disabled={!data || !livres?.horarios.length} onChange={(e) => setHorario(e.target.value)}>
            <option value="">{!data ? 'Escolha a data' : livres ? 'Selecione' : 'Carregando...'}</option>
            {livres?.horarios.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          {erro('horario')}
        </label>

        {ehCirurgia ? (
          <>
            <label className="campo-form">
              <span>Olho</span>
              <select value={olho} onChange={(e) => setOlho(e.target.value)}>
                {OLHOS.map((o) => (
                  <option key={o.valor} value={o.valor}>{o.nome}</option>
                ))}
              </select>
              {erro('olho')}
            </label>
            <label className="campo-form">
              <span>Tipo</span>
              <select value={tipoCirurgia} onChange={(e) => setTipoCirurgia(e.target.value)}>
                {TIPOS_DE_CIRURGIA.map((t) => (
                  <option key={t.valor} value={t.valor}>{t.nome}</option>
                ))}
              </select>
              {erro('tipo_cirurgia')}
            </label>
          </>
        ) : (
          <label className="campo-form">
            <span>Motivo</span>
            <input value={motivo} placeholder="Motivo" onChange={(e) => setMotivo(e.target.value)} />
            {erro('motivo')}
          </label>
        )}

        <label className="campo-form">
          <span>Plano</span>
          <input value={plano} readOnly />
        </label>

        {/* Aviso quando o dia escolhido não tem vaga (ex.: dia de cirurgia, limite atingido) */}
        {livres?.aviso && <p className="mensagem mensagem-aviso largura-toda">{livres.aviso}</p>}

        {ehCirurgia && (
          <label className="campo-form largura-toda">
            <span>Precauções</span>
            <textarea rows={3} placeholder="Jejum, preparos..." value={precaucoes} onChange={(e) => setPrecaucoes(e.target.value)} />
          </label>
        )}

        <label className="campo-form largura-toda">
          <span>Observação</span>
          <textarea rows={3} placeholder="Observação..." value={observacao} onChange={(e) => setObservacao(e.target.value)} />
        </label>
      </div>

      {erros.geral && <p className="mensagem mensagem-erro">{erros.geral}</p>}

      <div className="rodape-formulario entre">
        <button type="button" className="link-trocar" onClick={aoTrocarPaciente}>Trocar paciente</button>
        <button type="submit" className="botao-formulario" disabled={enviando}>
          {enviando ? 'Agendando...' : 'Agendar'}
        </button>
      </div>
    </form>
  )
}
