import { api } from './api.js'

/**
 * @typedef {Object} MeuPerfil
 * @property {string} id
 * @property {string} nome
 * @property {string} email
 * @property {string|null} fotoUrl
 * @property {string|null} bio
 * @property {string|null} cursoOuArea
 * @property {string|null} instituicao
 * @property {string[]} topicosInteresse
 * @property {string[]} topicosAjuda
 * @property {string} criadoEm
 */

/**
 * @typedef {Object} PerfilPublico
 * @property {string} id
 * @property {string} nome
 * @property {string|null} fotoUrl
 * @property {string|null} bio
 * @property {string|null} cursoOuArea
 * @property {string|null} instituicao
 * @property {string[]} topicosInteresse
 * @property {string[]} topicosAjuda
 * @property {string} criadoEm
 */

/** @returns {Promise<MeuPerfil>} */
export async function obterMeuPerfil() {
  const { data } = await api.get('/users/me/profile')
  return data
}

/** @param {string} usuarioId @returns {Promise<PerfilPublico>} */
export async function obterPerfilPublico(usuarioId) {
  const { data } = await api.get(`/users/${usuarioId}/profile`)
  return data
}

/** @returns {Promise<PerfilPublico[]>} */
export async function listarPerfisPublicos() {
  const { data } = await api.get('/users')
  return data
}

/**
 * @param {{ nome: string, bio?: string|null, cursoOuArea?: string|null, instituicao?: string|null, topicosInteresse: string[], topicosAjuda: string[] }} dados
 * @returns {Promise<MeuPerfil>}
 */
export async function atualizarPerfil(dados) {
  const { data } = await api.put('/users/me/profile', dados)
  return data
}

/** @param {File} arquivo @returns {Promise<{ fotoUrl: string }>} */
export async function enviarFoto(arquivo) {
  const formData = new FormData()
  formData.append('foto', arquivo)

  // Sem Content-Type manual: o browser define multipart/form-data com boundary.
  const { data } = await api.post('/users/me/profile/foto', formData)

  return data
}
