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
