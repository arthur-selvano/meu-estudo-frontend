import { CalendarDays } from 'lucide-react'
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO } from '../styles/ui'
import { formatarDataHora } from '../utils/datas'

export default function ConvitesPendentes({ convites, respondendo, onResponder }) {
  return (
    <section className={`${CARTAO} min-w-0 p-4`}>
      <h2 className="text-sm font-semibold text-ink">Convite pendente</h2>

      {convites.length === 0 ? (
        <p className="mt-2 text-sm text-ink-muted">Nenhum convite pendente.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {convites.map((convite) => (
            <li
              key={convite.grupoId}
              className="rounded-lg border border-line-soft bg-surface-muted p-3"
            >
              <p className="break-words font-medium text-ink">
                {convite.grupoTitulo}
              </p>
              <p className="mt-0.5 break-words text-xs text-ink-secondary">
                Convite de {convite.donoNome}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                <CalendarDays aria-hidden="true" size={13} />
                {formatarDataHora(convite.convidadoEm)}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onResponder(convite.grupoId, true)}
                  disabled={respondendo}
                  className={`${BOTAO_PRIMARIO} min-h-11 flex-1 px-3 py-2 text-xs`}
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  onClick={() => onResponder(convite.grupoId, false)}
                  disabled={respondendo}
                  className={`${BOTAO_SECUNDARIO} min-h-11 flex-1 px-3 py-2 text-xs`}
                >
                  Recusar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
