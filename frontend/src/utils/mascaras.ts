// Máscaras: o que a pessoa vê formatado; para a API vão só os números

export function soNumeros(texto: string): string {
  return texto.replace(/\D/g, '')
}

// "12345678901" -> "123.456.789-01"
export function mascaraCPF(texto: string): string {
  const n = soNumeros(texto).slice(0, 11)
  return n
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

// "79999545454" -> "(79) 99954-5454"   (fixo com 10 dígitos: "(79) 3211-1234")
export function mascaraCelular(texto: string): string {
  const n = soNumeros(texto).slice(0, 11)
  if (n.length <= 2) return n.length ? `(${n}` : ''
  const ddd = n.slice(0, 2)
  const resto = n.slice(2)
  const meio = resto.length > 8 ? 5 : 4
  return resto.length > meio
    ? `(${ddd}) ${resto.slice(0, meio)}-${resto.slice(meio)}`
    : `(${ddd}) ${resto}`
}
