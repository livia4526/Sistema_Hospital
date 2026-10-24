import { PLANOS } from '../types'
import { paraTextoISO } from '../utils/datas'
import { mascaraCPF, mascaraCelular } from '../utils/mascaras'
import type { CamposDoPaciente, ErrosDoPaciente } from '../utils/paciente'

// Campos do cadastro do paciente. Usados no "Novo paciente" e na ficha (para editar).

type Props = {
  campos: CamposDoPaciente
  erros: ErrosDoPaciente
  mudar: (campo: keyof CamposDoPaciente, valor: string) => void
  somenteLeitura?: boolean // na ficha, os campos só ficam editáveis depois de clicar em "Editar"
}

export function CamposPaciente({ campos, erros, mudar, somenteLeitura = false }: Props) {
  const erro = (campo: keyof ErrosDoPaciente) =>
    erros[campo] ? <span className="erro-campo">{erros[campo]}</span> : null

  return (
    <fieldset className="grade" disabled={somenteLeitura}>
      <label className="campo-form largura-toda">
        <span>Nome</span>
        <input value={campos.nome} onChange={(e) => mudar('nome', e.target.value)} placeholder="Nome" />
        {erro('nome')}
      </label>

      <label className="campo-form">
        <span>Data de nascimento</span>
        <input
          type="date"
          max={paraTextoISO(new Date())}
          value={campos.data_nascimento}
          onChange={(e) => mudar('data_nascimento', e.target.value)}
        />
        {erro('data_nascimento')}
      </label>

      <label className="campo-form">
        <span>Sexo</span>
        <select value={campos.sexo} onChange={(e) => mudar('sexo', e.target.value)}>
          <option value="">Selecione</option>
          <option value="F">Feminino</option>
          <option value="M">Masculino</option>
          <option value="O">Outro</option>
        </select>
      </label>

      <label className="campo-form">
        <span>Plano</span>
        <select value={campos.plano} onChange={(e) => mudar('plano', e.target.value)}>
          {PLANOS.map((p) => (
            <option key={p.valor} value={p.valor}>{p.nome}</option>
          ))}
        </select>
      </label>

      <label className="campo-form">
        <span>Celular</span>
        <input
          inputMode="numeric"
          placeholder="(79) 99999-9999"
          value={campos.celular}
          onChange={(e) => mudar('celular', mascaraCelular(e.target.value))}
        />
        {erro('celular')}
      </label>

      {/* Só aparece quando o plano é "Outros" */}
      {campos.plano === 'outros' && (
        <label className="campo-form largura-toda">
          <span>Qual plano?</span>
          <input
            value={campos.plano_outro}
            onChange={(e) => mudar('plano_outro', e.target.value)}
            placeholder="Nome do plano"
          />
          {erro('plano_outro')}
        </label>
      )}

      <label className="campo-form largura-3">
        <span>E-mail</span>
        <input type="email" placeholder="Email" value={campos.email} onChange={(e) => mudar('email', e.target.value)} />
        {erro('email')}
      </label>

      <label className="campo-form">
        <span>CPF</span>
        <input
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={campos.cpf}
          onChange={(e) => mudar('cpf', mascaraCPF(e.target.value))}
        />
        {erro('cpf')}
      </label>

      <label className="campo-form largura-toda">
        <span>Informações complementares</span>
        <textarea
          rows={3}
          placeholder="Ex.: Diabético, Hipertenso, Alérgico..."
          value={campos.informacoes_complementares}
          onChange={(e) => mudar('informacoes_complementares', e.target.value)}
        />
      </label>
    </fieldset>
  )
}
