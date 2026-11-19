import { AlertTriangle, Loader2, X } from 'lucide-react'
import Modal from './Modal'
import { BOTAO_PERIGO, BOTAO_SECUNDARIO } from '../styles/ui'

/**
 * Confirmação de ações destrutivas. Reutiliza o Modal acessível e o padrão
 * de botões da aplicação; fica bloqueado enquanto a ação está em andamento.
 */
export default function ModalConfirmacao({
  titulo,
  mensagem,
  detalhe,
  rotuloConfirmar = 'Confirmar',
  rotuloCancelar = 'Cancelar',
  carregando = false,
  onConfirmar,
  onFechar,
}) {
  return (
    <Modal
      labelledBy="titulo-modal-confirmacao"
      onFechar={onFechar}
      bloqueado={carregando}
      className="max-w-md"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line-soft px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-bg text-danger-ink">
            <AlertTriangle aria-hidden="true" size={18} />
          </span>
          <div className="min-w-0">
            <h2
              id="titulo-modal-confirmacao"
              className="break-words text-base font-semibold leading-tight"
            >
              {titulo}
            </h2>
            <p className="mt-1 break-words text-sm leading-normal text-ink-secondary">
              {mensagem}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onFechar}
          disabled={carregando}
          aria-label="Fechar confirmação"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-1.5 text-ink-secondary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:opacity-50"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="space-y-4 px-4 py-5 sm:px-5">
        {detalhe && (
          <p className="break-words rounded-lg border border-line-soft bg-surface-muted px-3 py-2 text-sm font-medium text-ink-soft">
            {detalhe}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onFechar}
            disabled={carregando}
            className={`${BOTAO_SECUNDARIO} min-h-11 w-full px-4 py-2.5 text-sm sm:w-auto`}
          >
            {rotuloCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={carregando}
            aria-busy={carregando}
            className={`${BOTAO_PERIGO} min-h-11 w-full px-4 py-2.5 text-sm sm:w-auto`}
          >
            {carregando && (
              <Loader2
                aria-hidden="true"
                size={16}
                className="motion-safe:animate-spin"
              />
            )}
            {carregando ? 'Processando...' : rotuloConfirmar}
          </button>
        </div>
      </div>
    </Modal>
  )
}
