const ESTILOS = {
  Aceito: 'border-[#B7D2B4] bg-[#E3EFE0] text-[#245B34]',
  Pendente: 'border-[#E7D3A2] bg-[#FBF3DF] text-[#7A5312]',
  Recusado: 'border-[#D7DCD6] bg-[#F0F2EE] text-[#67746B]',
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
