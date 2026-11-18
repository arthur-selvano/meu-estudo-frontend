export const MAX_TOPICOS = 10
export const MAX_CARACTERES_TOPICO = 40

/** Catálogo curado exibido como chips. Tags fora dele continuam permitidas. */
export const CATALOGO_TOPICOS = [
  'Algoritmos',
  'Estruturas de Dados',
  'C#',
  'JavaScript',
  'React',
  'Python',
  'Banco de Dados',
  'Redes',
  'Segurança',
  'Cloud',
  'DevOps',
  'Docker',
  'Git',
  'Linux',
  'Matemática',
  'Estatística',
  'Machine Learning',
  'UI Design',
  'Inglês',
  'Escrita Acadêmica',
  'Gestão de Projetos',
  'Testes de Software',
  'POO',
  'APIs REST',
]

function normalizarTopico(valor) {
  return String(valor ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

function chaveDoTopico(valor) {
  return normalizarTopico(valor).toLocaleLowerCase('pt-BR')
}

/** @param {string[]} topicos @param {string} valor */
export function contemTopico(topicos, valor) {
  const alvo = chaveDoTopico(valor)
  return topicos.some((topico) => chaveDoTopico(topico) === alvo)
}

/** @param {string[]} topicos @param {string} valor @returns {string[]} */
export function removerTopico(topicos, valor) {
  const alvo = chaveDoTopico(valor)
  return topicos.filter((topico) => chaveDoTopico(topico) !== alvo)
}

/**
 * Adiciona um tópico validando limite, tamanho e duplicatas.
 * @param {string[]} topicos
 * @param {string} valor
 * @returns {{ topicos: string[], erro: string|null }}
 */
export function incluirTopico(topicos, valor) {
  const normalizado = normalizarTopico(valor)

  if (!normalizado) {
    return { topicos, erro: 'Digite um tópico.' }
  }

  if (normalizado.length > MAX_CARACTERES_TOPICO) {
    return {
      topicos,
      erro: `O tópico deve ter no máximo ${MAX_CARACTERES_TOPICO} caracteres.`,
    }
  }

  if (contemTopico(topicos, normalizado)) {
    return { topicos, erro: 'Esse tópico já foi adicionado.' }
  }

  if (topicos.length >= MAX_TOPICOS) {
    return { topicos, erro: `Você pode escolher até ${MAX_TOPICOS} tópicos.` }
  }

  return { topicos: [...topicos, normalizado], erro: null }
}
