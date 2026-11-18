import { api } from './api.js'

/**
 * @typedef {Object} MembroGrupo
 * @property {string} usuarioId
 * @property {string} nome
 * @property {'Pendente'|'Aceito'|'Recusado'} status
 */

/**
 * @typedef {Object} ColunaKanban
 * @property {string} id
 * @property {string} titulo
 * @property {number} ordem
 */

/**
 * @typedef {Object} TopicoEstudo
 * @property {string} id
 * @property {string} titulo
 * @property {string|null} descricao
 * @property {string|null} dataPrevista  Formato YYYY-MM-DD.
 * @property {'BAIXA'|'MEDIA'|'ALTA'} prioridade
 * @property {string} colunaId
 * @property {number} ordem
 * @property {string|null} responsavelId
 * @property {string|null} responsavelNome
 * @property {string|null} responsavelFotoUrl
 * @property {boolean} concluido
 * @property {string} criadoPorId
 * @property {string} criadoEm
 */

/**
 * @typedef {Object} GrupoEstudo
 * @property {string} id
 * @property {string} titulo
 * @property {string|null} descricao
 * @property {'PESSOAL'|'TRABALHO_ACADEMICO'} tipo
 * @property {string} donoId
 * @property {string} donoNome
 * @property {string} criadoEm
 * @property {ColunaKanban[]} colunas
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

/**
 * @param {{
 *   titulo: string,
 *   descricao?: string|null,
 *   tipo?: 'PESSOAL'|'TRABALHO_ACADEMICO'
 * }} dados
 */
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
 * @param {{
 *   titulo: string,
 *   descricao?: string|null,
 *   dataPrevista?: string|null,
 *   prioridade?: 'BAIXA'|'MEDIA'|'ALTA',
 *   responsavelId?: string|null
 * }} dados
 * @returns {Promise<TopicoEstudo>}
 */
export async function adicionarTopico(grupoId, dados) {
  const { data } = await api.post(`/grupos/${grupoId}/topicos`, dados)
  return data
}

/**
 * Move um card para outra coluna do Kanban, na posição informada.
 * @param {string} topicoId
 * @param {{ colunaId: string, ordem: number }} destino
 * @returns {Promise<TopicoEstudo|null>}
 */
export async function moverTopico(topicoId, { colunaId, ordem }) {
  const { data } = await api.patch(`/topicos/${topicoId}/mover`, {
    colunaId,
    ordem,
  })

  return data ?? null
}

/**
 * Define o responsável de um card. `null` remove a atribuição.
 * @param {string} topicoId
 * @param {string|null} responsavelId
 * @returns {Promise<TopicoEstudo|null>}
 */
export async function alterarResponsavelTopico(topicoId, responsavelId) {
  const { data } = await api.patch(`/topicos/${topicoId}/responsavel`, {
    responsavelId: responsavelId || null,
  })

  return data ?? null
}
