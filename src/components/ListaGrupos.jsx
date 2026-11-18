import { Plus } from 'lucide-react'
import { BOTAO_SECUNDARIO, CARTAO } from '../styles/ui'

export default function ListaGrupos({
  grupos,
  selecionadoId,
  onSelecionar,
  formularioAberto,
  onAlternarFormulario,
}) {
  return (
    <section className={`${CARTAO} p-4`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg">Meus grupos</h2>
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
        <p className="mt-3 text-sm text-[#6B7D71]">
          Você ainda não participa de nenhum grupo.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {grupos.map((grupo) => {
            const selecionado = grupo.id === selecionadoId

            return (
              <li key={grupo.id}>
                <button
                  type="button"
                  onClick={() => onSelecionar(grupo.id)}
                  aria-current={selecionado ? 'true' : undefined}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/20 ${
                    selecionado
                      ? 'border-[#8FB08F] bg-[#E3EFE0] text-[#173D2E]'
                      : 'border-transparent text-[#33473C] hover:bg-[#F0F4EC]'
                  }`}
                >
                  <span className="block truncate font-medium">{grupo.titulo}</span>
                  <span className="mt-0.5 block text-xs text-[#6B7D71]">
                    {grupo.topicos.length}{' '}
                    {grupo.topicos.length === 1 ? 'tópico' : 'tópicos'}
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
