import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { DURACAO_TOAST } from '../utils/toasts'

const ESTILOS = {
  sucesso: {
    caixa: 'border-success-line bg-success-bg text-success-ink',
    fechar: 'hover:bg-success-hover focus-visible:ring-success-ink/30',
    Icone: CheckCircle2,
  },
  erro: {
    caixa: 'border-danger-line bg-danger-bg text-danger-ink',
    fechar: 'hover:bg-danger-hover focus-visible:ring-danger-ink/30',
    Icone: AlertCircle,
  },
}

function ToastItem({ toast, onFechar }) {
  const [pausado, setPausado] = useState(false)
  const estilo = ESTILOS[toast.tipo] ?? ESTILOS.erro
  const Icone = estilo.Icone

  useEffect(() => {
    if (pausado) return undefined

    const temporizador = setTimeout(
      () => onFechar(toast.id),
      DURACAO_TOAST[toast.tipo],
    )

    return () => clearTimeout(temporizador)
  }, [pausado, toast.id, toast.tipo, onFechar])

  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setPausado(false)
  }

  return (
    <div
      role={toast.tipo === 'erro' ? 'alert' : 'status'}
      aria-atomic="true"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={handleBlur}
      className={`pointer-events-auto motion-safe:animate-[toast-entrar_180ms_ease-out] flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg ${estilo.caixa}`}
    >
      <Icone aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
      <p className="min-w-0 flex-1 break-words leading-snug">
        {toast.mensagem}
      </p>
      <button
        type="button"
        onClick={() => onFechar(toast.id)}
        aria-label="Fechar notificação"
        className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 ${estilo.fechar}`}
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  )
}

export default function ToastViewport({ toasts, onFechar }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onFechar={onFechar} />
      ))}
    </div>
  )
}
