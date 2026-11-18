import { prioridadeInfo } from '../utils/prioridades'

export default function PrioridadeBadge({ prioridade }) {
  const info = prioridadeInfo(prioridade)

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${info.estilo}`}
    >
      {info.rotulo}
    </span>
  )
}
