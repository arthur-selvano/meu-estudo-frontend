const ESTILOS = {
  Aceito: 'border-success-line bg-success-bg text-success-ink',
  Pendente: 'border-warning-line bg-warning-bg text-warning-ink',
  Recusado: 'border-neutral-line bg-neutral-bg text-neutral-ink',
}

export default function StatusBadge({ status }) {
  const estilo = ESTILOS[status] ?? ESTILOS.Recusado

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${estilo}`}
    >
      {status}
    </span>
  )
}
