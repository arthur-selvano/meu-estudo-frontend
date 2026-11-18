import { AlertCircle, CheckCircle2, X } from 'lucide-react'

const ESTILOS = {
  erro: {
    caixa: 'border-[#E3C4B5] bg-[#FBEDE7] text-[#8A3B1E]',
    fechar: 'hover:bg-[#F3D9CE] focus-visible:ring-[#8A3B1E]/30',
    Icone: AlertCircle,
  },
  sucesso: {
    caixa: 'border-[#B7D2B4] bg-[#E3EFE0] text-[#245B34]',
    fechar: 'hover:bg-[#D2E4CE] focus-visible:ring-[#245B34]/30',
    Icone: CheckCircle2,
  },
}

export default function FeedbackBanner({
  tipo = 'erro',
  mensagem,
  onFechar,
  className = '',
}) {
  if (!mensagem) return null

  const estilo = ESTILOS[tipo] ?? ESTILOS.erro
  const Icone = estilo.Icone

  return (
    <div
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${estilo.caixa} ${className}`}
    >
      <Icone aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 leading-snug">{mensagem}</p>
      {onFechar && (
        <button
          type="button"
          onClick={onFechar}
          aria-label={`Fechar mensagem de ${tipo}`}
          className={`rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 ${estilo.fechar}`}
        >
          <X aria-hidden="true" size={16} />
        </button>
      )}
    </div>
  )
}
