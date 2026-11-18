import { CalendarDays } from 'lucide-react'
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO } from '../styles/ui'
import { formatarDataHora } from '../utils/datas'

export default function ConvitesPendentes({ convites, respondendo, onResponder }) {
  return (
    <section className={`${CARTAO} p-4`}>
      <h2 className="font-serif text-lg">Convites pendentes</h2>

      {convites.length === 0 ? (
        <p className="mt-2 text-sm text-[#6B7D71]">Nenhum convite pendente.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {convites.map((convite) => (
            <li
              key={convite.grupoId}
              className="rounded-lg border border-[#E1E8DE] bg-[#FAFBF8] p-3"
            >
              <p className="font-medium text-[#12251D]">{convite.grupoTitulo}</p>
              <p className="mt-0.5 text-xs text-[#53655C]">
                Convite de {convite.donoNome}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#6B7D71]">
                <CalendarDays aria-hidden="true" size={13} />
                {formatarDataHora(convite.convidadoEm)}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onResponder(convite.grupoId, true)}
                  disabled={respondendo}
                  className={`${BOTAO_PRIMARIO} flex-1 px-3 py-2 text-xs`}
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  onClick={() => onResponder(convite.grupoId, false)}
                  disabled={respondendo}
                  className={`${BOTAO_SECUNDARIO} flex-1 px-3 py-2 text-xs`}
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
