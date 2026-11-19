import { api } from './api.js'

/**
 * @typedef {Object} ComentarioPublicacao
 * @property {string} id
 * @property {string} autorId
 * @property {string} autorNome
 * @property {string|null} autorFotoUrl
 * @property {string} conteudo
 * @property {string} criadoEm
 */

/**
 * @typedef {Object} Publicacao
 * @property {string} id
 * @property {'ESTUDO'|'AULA'|'LINK'|'DOCUMENTO'} tipo
 * @property {string} autorId
 * @property {string} autorNome
 * @property {string|null} autorFotoUrl
 * @property {string|null} titulo
 * @property {string} conteudo
 * @property {string|null} linkUrl
 * @property {string|null} arquivoUrl
 * @property {string|null} arquivoNome
 * @property {string} criadoEm
 * @property {number} curtidas
 * @property {boolean} curtidoPorMim
 * @property {ComentarioPublicacao[]} comentarios
 */

/** @returns {Promise<Publicacao[]>} */
export async function listarPublicacoes() {
  const { data } = await api.get('/publicacoes')
  return data
}

/**
 * @param {{
 *   tipo: string,
 *   titulo?: string,
 *   conteudo: string,
 *   linkUrl?: string,
 *   arquivo?: File|null
 * }} dados
 * @returns {Promise<Publicacao>}
 */
export async function criarPublicacao({ tipo, titulo, conteudo, linkUrl, arquivo }) {
  const formData = new FormData()

  formData.append('tipo', tipo)
  formData.append('conteudo', conteudo)

  if (titulo?.trim()) formData.append('titulo', titulo.trim())
  if (linkUrl?.trim()) formData.append('linkUrl', linkUrl.trim())
  if (arquivo) formData.append('arquivo', arquivo)

  // Sem Content-Type manual: o browser define multipart/form-data com boundary.
  const { data } = await api.post('/publicacoes', formData)

  return data
}

/** @param {string} publicacaoId @returns {Promise<Publicacao>} */
export async function alternarCurtida(publicacaoId) {
  const { data } = await api.patch(`/publicacoes/${publicacaoId}/curtida`)
  return data
}

/**
 * @param {string} publicacaoId
 * @param {string} conteudo
 * @returns {Promise<Publicacao>}
 */
export async function comentarPublicacao(publicacaoId, conteudo) {
  const { data } = await api.post(`/publicacoes/${publicacaoId}/comentarios`, {
    conteudo,
  })

  return data
}

/** @param {string} publicacaoId */
export async function excluirPublicacao(publicacaoId) {
  await api.delete(`/publicacoes/${publicacaoId}`)
}
