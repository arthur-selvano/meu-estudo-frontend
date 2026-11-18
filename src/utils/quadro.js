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

/** Colunas do quadro, ordenadas; cai nas colunas padrão quando ausentes. */
export function obterColunas(grupo) {
  const colunas = Array.isArray(grupo?.colunas) ? grupo.colunas : []

  const normalizadas = [...colunas]
    .filter((coluna) => coluna?.id && coluna?.titulo)
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))

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
