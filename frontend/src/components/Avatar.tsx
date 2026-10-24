import type { Usuario } from '../types'
import './Avatar.css'

// Foto do usuário; sem foto, um círculo com as iniciais do nome
export function Avatar({ usuario, tamanho = 36 }: { usuario: Usuario; tamanho?: number }) {
  const iniciais = usuario.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')

  return usuario.foto ? (
    <img className="avatar" src={usuario.foto} alt="" width={tamanho} height={tamanho} />
  ) : (
    <span className="avatar avatar-iniciais" style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.4 }} aria-hidden="true">
      {iniciais}
    </span>
  )
}
