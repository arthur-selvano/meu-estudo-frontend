import { Plus } from 'lucide-react'
import { BOTAO_SECUNDARIO, CARTAO } from '../styles/ui'
import { ehQuadroPessoal } from '../utils/quadro'

export default function ListaGrupos({
  grupos,
  selecionadoId,
  onSelecionar,
  formularioAberto,
  onAlternarFormulario,
}) {
  return (
    <section className={`${CARTAO} min-w-0 p-4`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Meu quadro</h2>
        <button
          type="button"
          onClick={onAlternarFormulario}
          className={`${BOTAO_SECUNDARIO} px-2.5 py-1.5 text-xs`}
        >
          <Plus aria-hidden="true" size={14} />
          {formularioAberto ? 'Fechar' : 'Novo'}
        </button>
      </div>

      {grupos.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">
          Você ainda não participa de nenhum quadro.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {grupos.map((grupo) => {
            const selecionado = grupo.id === selecionadoId
            const pessoal = ehQuadroPessoal(grupo)

            return (
              <li key={grupo.id}>
                <button
                  type="button"
                  onClick={() => onSelecionar(grupo.id)}
                  aria-current={selecionado ? 'true' : undefined}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/20 ${
                    selecionado
                      ? 'border-field-line bg-surface-hover text-ink'
                      : 'border-transparent text-ink-soft hover:bg-surface-hover'
                  }`}
                >
                  <span className="block truncate font-medium">{grupo.titulo}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        pessoal
                          ? 'bg-surface-hover text-ink-muted'
                          : 'border border-line bg-surface text-ink-muted'
                      }`}
                    >
                      {pessoal ? 'Pessoal' : 'Acadêmico'}
                    </span>
                    {grupo.topicos.length}{' '}
                    {grupo.topicos.length === 1 ? 'card' : 'cards'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
