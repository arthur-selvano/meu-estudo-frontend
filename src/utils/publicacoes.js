export const LIMITE_CONTEUDO_PUBLICACAO = 1000
export const LIMITE_TITULO_PUBLICACAO = 150
export const LIMITE_COMENTARIO = 500
export const TAMANHO_MAXIMO_ANEXO = 10 * 1024 * 1024
export const EXTENSOES_ANEXO =
  '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp'

export const TIPOS_PUBLICACAO = [
  {
    valor: 'ESTUDO',
    rotulo: 'Pedido de estudo',
    descricao: 'Encontre gente para estudar junto.',
    placeholder: 'Ex.: Alguém pra estudar C#?',
    classeBadge: 'border-accent-line bg-accent-soft text-accent-ink',
  },
  {
    valor: 'AULA',
    rotulo: 'Aula',
    descricao: 'Compartilhe uma aula ou explicação.',
    placeholder: 'Ex.: Aula sobre herança de classes em C#',
    classeBadge: 'border-success-line bg-success-bg text-success-ink',
  },
  {
    valor: 'LINK',
    rotulo: 'Link',
    descricao: 'Indique um material externo.',
    placeholder: 'Conte por que este link ajuda nos estudos.',
    classeBadge: 'border-line bg-surface-soft text-ink-soft',
  },
  {
    valor: 'DOCUMENTO',
    rotulo: 'Documento',
    descricao: 'Disponibilize um arquivo de estudo.',
    placeholder: 'Descreva o documento e para quem ele é útil.',
    classeBadge: 'border-warning-line bg-warning-bg text-warning-ink',
  },
]

export function infoTipoPublicacao(valor) {
  return TIPOS_PUBLICACAO.find((tipo) => tipo.valor === valor) ?? TIPOS_PUBLICACAO[0]
}

export function formatarTamanhoArquivo(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''

  const megabytes = bytes / (1024 * 1024)

  if (megabytes >= 1) return `${megabytes.toFixed(1).replace('.', ',')} MB`

  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
