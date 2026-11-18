export const PRIORIDADES = [
  {
    valor: 'BAIXA',
    rotulo: 'Baixa',
    estilo: 'border-[#CBD6C8] bg-[#F0F4EC] text-[#3F5A45]',
  },
  {
    valor: 'MEDIA',
    rotulo: 'Média',
    estilo: 'border-[#E7D3A2] bg-[#FBF3DF] text-[#7A5312]',
  },
  {
    valor: 'ALTA',
    rotulo: 'Alta',
    estilo: 'border-[#E3B4A8] bg-[#FBEDE7] text-[#8A3B1E]',
  },
]

export const PRIORIDADE_PADRAO = 'MEDIA'

export function prioridadeInfo(valor) {
  return (
    PRIORIDADES.find((prioridade) => prioridade.valor === valor) ??
    PRIORIDADES[1]
  )
}
