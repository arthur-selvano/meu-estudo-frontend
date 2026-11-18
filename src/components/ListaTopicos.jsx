import { CalendarDays, Check } from 'lucide-react'
import { formatarDataSimples } from '../utils/datas'

export default function ListaTopicos({ topicos, alternando, onAlternar }) {
  if (topicos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[#CBD6C8] px-3 py-4 text-sm text-[#6B7D71]">
        Nenhum tópico criado ainda.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {topicos.map((topico) => (
        <li key={topico.id}>
          <button
            type="button"
            role="checkbox"
            aria-checked={topico.concluido}
            disabled={alternando}
            onClick={() => onAlternar(topico.id)}
            className="flex w-full items-start gap-3 rounded-lg border border-[#E1E8DE] bg-[#FAFBF8] px-3 py-2.5 text-left transition-colors hover:bg-[#F0F4EC] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/20 disabled:cursor-wait disabled:opacity-70"
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                topico.concluido
                  ? 'border-[#2F6F4E] bg-[#2F6F4E] text-white'
                  : 'border-[#B7C3B4] bg-white'
              }`}
            >
              {topico.concluido && <Check size={13} strokeWidth={3} />}
            </span>

            <span className="min-w-0">
              <span
                className={`block text-sm font-medium ${
                  topico.concluido
                    ? 'text-[#6B7D71] line-through'
                    : 'text-[#12251D]'
                }`}
              >
                {topico.titulo}
              </span>

              {topico.descricao && (
                <span className="mt-0.5 block text-xs leading-relaxed text-[#6B7D71]">
                  {topico.descricao}
                </span>
              )}

              {topico.dataPrevista && (
                <span className="mt-1 flex items-center gap-1 text-xs text-[#6B7D71]">
                  <CalendarDays aria-hidden="true" size={12} />
                  {formatarDataSimples(topico.dataPrevista)}
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
