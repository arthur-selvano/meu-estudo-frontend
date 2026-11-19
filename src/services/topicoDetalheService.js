/**
 * @typedef {Object} Subtarefa
 * @property {string} id
 * @property {string} titulo
 * @property {boolean} concluida
 * @property {string} criadaEm
 *
 * @typedef {Object} LinkReferencia
 * @property {string} id
 * @property {string} titulo
 * @property {string} url
 * @property {string} criadoEm
 *
 * @typedef {Object} ComentarioTopico
 * @property {string} id
 * @property {string} autorId
 * @property {string} autorNome
 * @property {string} texto
 * @property {string} criadoEm
 *
 * @typedef {Object} AtividadeTopico
 * @property {string} id
 * @property {string} autorNome
 * @property {string} texto
 * @property {string} criadoEm
 *
 * @typedef {Object} DetalheTopico
 * @property {Subtarefa[]} subtarefas
 * @property {LinkReferencia[]} links
 * @property {ComentarioTopico[]} comentarios
 * @property {AtividadeTopico[]} atividades
 */

/** @type {Map<string, DetalheTopico>} */
const detalhes = new Map()

function criarId(prefixo) {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function agora() {
  return new Date().toISOString()
}

/** @returns {DetalheTopico} */
function detalheVazio() {
  return { subtarefas: [], links: [], comentarios: [], atividades: [] }
}

/**
 * Substitua esta função por uma chamada real à API quando o endpoint existir.
 * @param {string} topicoId
 * @returns {DetalheTopico}
 */
export function obterDetalhe(topicoId) {
  if (!detalhes.has(topicoId)) detalhes.set(topicoId, detalheVazio())
  return detalhes.get(topicoId)
}

function registrarAtividade(detalhe, texto, autorNome) {
  detalhe.atividades.push({
    id: criarId('atividade'),
    autorNome: autorNome || 'Sistema',
    texto,
    criadoEm: agora(),
  })
}

/**
 * @param {string} topicoId
 * @param {string} titulo
 * @param {string} autorNome
 * @returns {Promise<DetalheTopico>}
 */
export async function adicionarSubtarefa(topicoId, titulo, autorNome) {
  const detalhe = obterDetalhe(topicoId)
  detalhe.subtarefas.push({
    id: criarId('subtarefa'),
    titulo,
    concluida: false,
    criadaEm: agora(),
  })
  registrarAtividade(detalhe, `Adicionou a subtarefa “${titulo}”.`, autorNome)
  return detalhe
}

/**
 * @param {string} topicoId
 * @param {string} subtarefaId
 * @param {string} autorNome
 * @returns {Promise<DetalheTopico>}
 */
export async function alternarSubtarefa(topicoId, subtarefaId, autorNome) {
  const detalhe = obterDetalhe(topicoId)
  const subtarefa = detalhe.subtarefas.find((item) => item.id === subtarefaId)

  if (subtarefa) {
    subtarefa.concluida = !subtarefa.concluida
    registrarAtividade(
      detalhe,
      `${subtarefa.concluida ? 'Concluiu' : 'Reabriu'} a subtarefa “${subtarefa.titulo}”.`,
      autorNome,
    )
  }

  return detalhe
}

/**
 * @param {string} topicoId
 * @param {string} subtarefaId
 * @param {string} autorNome
 * @returns {Promise<DetalheTopico>}
 */
export async function removerSubtarefa(topicoId, subtarefaId, autorNome) {
  const detalhe = obterDetalhe(topicoId)
  const subtarefa = detalhe.subtarefas.find((item) => item.id === subtarefaId)

  detalhe.subtarefas = detalhe.subtarefas.filter(
    (item) => item.id !== subtarefaId,
  )

  if (subtarefa) {
    registrarAtividade(
      detalhe,
      `Removeu a subtarefa “${subtarefa.titulo}”.`,
      autorNome,
    )
  }

  return detalhe
}

/**
 * @param {string} topicoId
 * @param {{ titulo: string, url: string }} link
 * @param {string} autorNome
 * @returns {Promise<DetalheTopico>}
 */
export async function adicionarLink(topicoId, { titulo, url }, autorNome) {
  const detalhe = obterDetalhe(topicoId)
  detalhe.links.push({
    id: criarId('link'),
    titulo,
    url,
    criadoEm: agora(),
  })
  registrarAtividade(detalhe, `Adicionou o link “${titulo}”.`, autorNome)
  return detalhe
}

/**
 * @param {string} topicoId
 * @param {string} linkId
 * @param {string} autorNome
 * @returns {Promise<DetalheTopico>}
 */
export async function removerLink(topicoId, linkId, autorNome) {
  const detalhe = obterDetalhe(topicoId)
  const link = detalhe.links.find((item) => item.id === linkId)

  detalhe.links = detalhe.links.filter((item) => item.id !== linkId)

  if (link) {
    registrarAtividade(detalhe, `Removeu o link “${link.titulo}”.`, autorNome)
  }

  return detalhe
}

/**
 * @param {string} topicoId
 * @param {string} texto
 * @param {{ id: string, nome: string }} autor
 * @returns {Promise<DetalheTopico>}
 */
export async function adicionarComentario(topicoId, texto, autor) {
  const detalhe = obterDetalhe(topicoId)
  detalhe.comentarios.push({
    id: criarId('comentario'),
    autorId: autor.id,
    autorNome: autor.nome,
    texto,
    criadoEm: agora(),
  })
  registrarAtividade(detalhe, `Comentou neste card.`, autor.nome)
  return detalhe
}
