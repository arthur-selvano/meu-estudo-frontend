export const TEMA_KEY = 'tema'
export const TEMA_CLARO = 'claro'
export const TEMA_ESCURO = 'escuro'

export function temaValido(valor) {
  return valor === TEMA_CLARO || valor === TEMA_ESCURO
}

export function resolverTemaInicial(salvo, prefereEscuro) {
  if (temaValido(salvo)) return salvo

  return prefereEscuro ? TEMA_ESCURO : TEMA_CLARO
}

export function proximoTema(tema) {
  return tema === TEMA_ESCURO ? TEMA_CLARO : TEMA_ESCURO
}
