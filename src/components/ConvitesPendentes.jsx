import { CalendarDays } from 'lucide-react'

function formatarData(valor) {
  if (!valor) return ''

  return new Intl.DateTimeFormat('pt-BR').format(new Date(valor))
}

export default function ConvitesPendentes({ convites, respondendo, onResponder }) {
  return (
    <section className="rounded-xl border border-[#CBD6C8] bg-white p-4 shadow-sm">
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
                {formatarData(convite.convidadoEm)}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onResponder(convite.grupoId, true)}
                  disabled={respondendo}
                  className="flex-1 rounded-lg bg-[#173D2E] px-3 py-2 text-xs font-semibold text-[#F4F6F0] transition-colors hover:bg-[#1F4D3A] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  onClick={() => onResponder(convite.grupoId, false)}
                  disabled={respondendo}
                  className="flex-1 rounded-lg border border-[#CBD6C8] px-3 py-2 text-xs font-semibold text-[#53655C] transition-colors hover:bg-[#F0F2EC] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/20 disabled:cursor-not-allowed disabled:opacity-60"
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
