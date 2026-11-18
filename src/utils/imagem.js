import { API_ORIGIN } from '../services/api'

/**
 * Converte o caminho relativo devolvido pela API em URL absoluta da imagem.
 * @param {string|null|undefined} fotoUrl
 * @returns {string|null}
 */
export function urlDaImagem(fotoUrl) {
  if (!fotoUrl) return null

  if (/^(https?:|blob:|data:)/i.test(fotoUrl)) return fotoUrl

  return `${API_ORIGIN}${fotoUrl.startsWith('/') ? '' : '/'}${fotoUrl}`
}
