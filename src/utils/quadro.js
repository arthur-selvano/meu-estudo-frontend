export const TIPO_PESSOAL = 'PESSOAL'
export const TIPO_TRABALHO_ACADEMICO = 'TRABALHO_ACADEMICO'
export const TIPO_PADRAO = TIPO_TRABALHO_ACADEMICO

/**
 * Colunas usadas enquanto a API ainda não devolve `colunas` no quadro.
 * Os ids funcionam como identificadores estáveis no front-end.
 */
export const COLUNAS_PADRAO = [
  { id: 'A_FAZER', titulo: 'A Fazer', ordem: 0 },
  { id: 'EM_ANDAMENTO', titulo: 'Em Andamento', ordem: 1 },
  { id: 'REVISAO', titulo: 'Revisão', ordem: 2 },
  { id: 'CONCLUIDO', titulo: 'Concluído', ordem: 3 },
]

export function ehQuadroPessoal(grupo) {
  return grupo?.tipo === TIPO_PESSOAL
}

/** Normaliza o tipo devolvido pela API (Sprint 1 não envia `tipo`). */
export function tipoDoQuadro(grupo) {
  return grupo?.tipo === TIPO_PESSOAL ? TIPO_PESSOAL : TIPO_PADRAO
}

/**
 * Colunas realmente devolvidas pela API, ordenadas. Seus ids são os GUIDs
 * persistidos no banco e são os únicos valores válidos para criar/mover cards.
 */
export function obterColunasReais(grupo) {
  const colunas = Array.isArray(grupo?.colunas) ? grupo.colunas : []

  return [...colunas]
    .filter((coluna) => coluna?.id && coluna?.titulo)
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
}

/**
 * Coluna inicial do quadro (menor ordem, ou seja, "A Fazer" nos quadros padrão).
 * Retorna `null` quando a API não devolveu colunas reais; os ids de
 * `COLUNAS_PADRAO` não servem para criar cards no backend.
 */
export function obterColunaInicial(grupo) {
  return obterColunasReais(grupo)[0] ?? null
}

/**
 * Coluna escolhida no formulário de criação. Se o id não existir no quadro
 * (ou nenhuma escolha tiver sido feita), usa a coluna inicial.
 */
export function obterColunaSelecionada(grupo, colunaId) {
  const colunas = obterColunasReais(grupo)

  return colunas.find((coluna) => coluna.id === colunaId) ?? colunas[0] ?? null
}

/** Colunas do quadro, ordenadas; cai nas colunas padrão quando ausentes. */
export function obterColunas(grupo) {
  const normalizadas = obterColunasReais(grupo)

  return normalizadas.length > 0 ? normalizadas : COLUNAS_PADRAO
}

/**
 * Coluna de um card. Cards da Sprint 1 não têm `colunaId`: os concluídos vão
 * para a última coluna e os demais para a primeira.
 */
export function idColunaDoTopico(topico, colunas) {
  if (!colunas.length) return null

  if (topico?.colunaId && colunas.some((coluna) => coluna.id === topico.colunaId)) {
    return topico.colunaId
  }

  return topico?.concluido
    ? colunas[colunas.length - 1].id
    : colunas[0].id
}

export function ordenarTopicos(a, b) {
  const ordemA = a.ordem ?? Number.MAX_SAFE_INTEGER
  const ordemB = b.ordem ?? Number.MAX_SAFE_INTEGER

  if (ordemA !== ordemB) return ordemA - ordemB

  return String(a.criadoEm ?? '').localeCompare(String(b.criadoEm ?? ''))
}

export function topicosDaColuna(topicos, colunaId, colunas) {
  return (topicos ?? [])
    .filter((topico) => idColunaDoTopico(topico, colunas) === colunaId)
    .sort(ordenarTopicos)
}

/**
 * Posição de destino ao mover um card: quantidade de cards já presentes na
 * coluna destino, desconsiderando o próprio card.
 */
export function calcularOrdemMover(topicos, topicoId, colunaId, colunas) {
  return topicosDaColuna(topicos, colunaId, colunas).filter(
    (item) => item.id !== topicoId,
  ).length
}

export function ehColunaConcluida(coluna, colunas) {
  return (
    Boolean(coluna) &&
    colunas.length > 0 &&
    coluna.id === colunas[colunas.length - 1].id
  )
}

/**
 * Pessoas que podem receber cards em um quadro de trabalho acadêmico:
 * dono e membros com convite aceito, sem duplicatas.
 */
export function participantesDoGrupo(grupo, usuario) {
  if (!grupo) return []

  const pessoas = [
    {
      id: grupo.donoId,
      nome: grupo.donoNome ?? usuario?.nome ?? 'Dono do quadro',
      fotoUrl:
        grupo.donoFotoUrl ??
        (usuario?.id === grupo.donoId ? usuario?.fotoUrl : null),
    },
    ...(grupo.membros ?? [])
      .filter((membro) => membro.status === 'Aceito')
      .map((membro) => ({
        id: membro.usuarioId,
        nome: membro.nome,
        fotoUrl:
          membro.fotoUrl ??
          (usuario?.id === membro.usuarioId ? usuario?.fotoUrl : null),
      })),
  ]

  const vistos = new Set()

  return pessoas.filter((pessoa) => {
    if (!pessoa.id || vistos.has(pessoa.id)) return false

    vistos.add(pessoa.id)
    return true
  })
}

/**
 * Aplica um evento em tempo real ao estado dos quadros. Substitui o card por id
 * quando ele já existe e insere quando é novo; grupos com outro id ficam intocados.
 */
export function atualizarTopicoNoGrupo(grupos, grupoId, topico) {
  return (grupos ?? []).map((grupo) => {
    if (grupo.id !== grupoId) return grupo

    const topicos = grupo.topicos ?? []

    return {
      ...grupo,
      topicos: topicos.some((item) => item.id === topico.id)
        ? topicos.map((item) =>
            item.id === topico.id ? { ...item, ...topico } : item,
          )
        : [...topicos, topico],
    }
  })
}

/**
 * Aplica a resposta de criação de um card. O evento em tempo real pode chegar antes
 * desta resposta, por isso a operação precisa ser idempotente: delega ao mesmo
 * upsert usado pelos eventos.
 */
export function adicionarTopicoNoGrupo(grupos, grupoId, topico) {
  return atualizarTopicoNoGrupo(grupos, grupoId, topico)
}
