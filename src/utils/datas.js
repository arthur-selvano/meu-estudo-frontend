const FORMATADOR = new Intl.DateTimeFormat('pt-BR')

/** Formata um instante ISO (ex.: `convidadoEm`) em data local pt-BR. */
export function formatarDataHora(valor) {
  if (!valor) return ''

  return FORMATADOR.format(new Date(valor))
}

/** Formata um DateOnly `YYYY-MM-DD` sem deslocamento de fuso. */
export function formatarDataSimples(valor) {
  if (!valor) return ''

  return FORMATADOR.format(new Date(`${valor}T00:00:00`))
}

/** Compara um DateOnly `YYYY-MM-DD` com o dia local atual. */
export function dataEstaVencida(valor) {
  if (!valor) return false

  const hoje = new Date()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')

  return valor < `${hoje.getFullYear()}-${mes}-${dia}`
}
