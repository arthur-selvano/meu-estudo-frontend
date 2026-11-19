export const PRIORIDADES = [
  {
    valor: 'BAIXA',
    rotulo: 'Baixa',
    estilo: 'border-line bg-surface-soft text-ink-soft',
  },
  {
    valor: 'MEDIA',
    rotulo: 'Média',
    estilo: 'border-warning-line bg-warning-bg text-warning-ink',
  },
  {
    valor: 'ALTA',
    rotulo: 'Alta',
    estilo: 'border-danger-line bg-danger-bg text-danger-ink',
  },
]

export const PRIORIDADE_PADRAO = 'MEDIA'

export function prioridadeInfo(valor) {
  return (
    PRIORIDADES.find((prioridade) => prioridade.valor === valor) ??
    PRIORIDADES[1]
  )
}
