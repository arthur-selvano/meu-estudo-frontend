import { API_ORIGIN } from '../services/api'
import { urlHttpSegura } from './urls'

/**
 * Converte o caminho relativo devolvido pela API em URL absoluta da imagem.
 * Aceita apenas caminhos locais da API, http/https e blob: (pré-visualização
 * local criada por URL.createObjectURL). Esquemas como data: e javascript:
 * não são renderizados.
 *
 * @param {string|null|undefined} fotoUrl
 * @returns {string|null}
 */
export function urlDaImagem(fotoUrl) {
  if (typeof fotoUrl !== 'string' || !fotoUrl.trim()) return null

  const valor = fotoUrl.trim()

  if (/^blob:/i.test(valor)) return valor
  if (/^https?:/i.test(valor)) return urlHttpSegura(valor)
  if (valor.startsWith('/')) return `${API_ORIGIN}${valor}`

  return null
}
