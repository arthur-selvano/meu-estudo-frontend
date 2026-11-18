import { api } from './api.js'

/**
 * @typedef {Object} MembroGrupo
 * @property {string} usuarioId
 * @property {string} nome
 * @property {'Pendente'|'Aceito'|'Recusado'} status
 */

/**
 * @typedef {Object} TopicoEstudo
 * @property {string} id
 * @property {string} titulo
 * @property {string|null} descricao
 * @property {string|null} dataPrevista  Formato YYYY-MM-DD.
 * @property {boolean} concluido
 * @property {string} criadoPorId
 * @property {string} criadoEm
 */

/**
 * @typedef {Object} GrupoEstudo
 * @property {string} id
 * @property {string} titulo
 * @property {string|null} descricao
 * @property {string} donoId
 * @property {string} donoNome
 * @property {string} criadoEm
 * @property {MembroGrupo[]} membros
 * @property {TopicoEstudo[]} topicos
 */

/**
 * @typedef {Object} ConvitePendente
 * @property {string} grupoId
 * @property {string} grupoTitulo
 * @property {string} donoId
 * @property {string} donoNome
 * @property {string} convidadoEm
 */

/** @returns {Promise<GrupoEstudo[]>} */
export async function listarMeusGrupos() {
  const { data } = await api.get('/grupos')
  return data
}

/** @param {{ titulo: string, descricao?: string|null }} dados */
export async function criarGrupo(dados) {
  const { data } = await api.post('/grupos', dados)
  return data
}

/** @returns {Promise<ConvitePendente[]>} */
export async function listarConvitesPendentes() {
  const { data } = await api.get('/grupos/convites')
  return data
}

/** @param {string} grupoId @param {string} email */
export async function convidarMembro(grupoId, email) {
  await api.post(`/grupos/${grupoId}/convites`, { email })
}

/** @param {string} grupoId @param {boolean} aceitar */
export async function responderConvite(grupoId, aceitar) {
  await api.patch(`/grupos/${grupoId}/convites/responder`, { aceitar })
}

/**
 * @param {string} grupoId
 * @param {{ titulo: string, descricao?: string|null, dataPrevista?: string|null }} dados
 * @returns {Promise<TopicoEstudo>}
 */
export async function adicionarTopico(grupoId, dados) {
  const { data } = await api.post(`/grupos/${grupoId}/topicos`, dados)
  return data
}

/** @param {string} grupoId @param {string} topicoId @returns {Promise<TopicoEstudo>} */
export async function alternarConclusaoTopico(grupoId, topicoId) {
  const { data } = await api.patch(`/grupos/${grupoId}/topicos/${topicoId}/concluir`)
  return data
}
