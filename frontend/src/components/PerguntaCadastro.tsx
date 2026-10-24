type Props = {
  aoResponder: (temCadastro: boolean) => void
}

// "O paciente possui cadastro?" — primeiro passo de todo agendamento
export function PerguntaCadastro({ aoResponder }: Props) {
  return (
    <section className="cartao pergunta">
      <p>O paciente possui cadastro?</p>
      <div className="pergunta-botoes">
        <button type="button" className="pergunta-sim" onClick={() => aoResponder(true)}>Sim</button>
        <button type="button" className="pergunta-nao" onClick={() => aoResponder(false)}>Não</button>
      </div>
    </section>
  )
}
