import { useEffect, useRef } from 'react'

/**
 * Modal acessível baseado no elemento nativo <dialog> com showModal():
 * foco preso no diálogo, fundo inerte, restauração de foco e Esc nativos.
 */
export default function Modal({
  labelledBy,
  label,
  onFechar,
  bloqueado = false,
  className = '',
  children,
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return undefined

    if (!dialog.open) dialog.showModal()

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflowAnterior
      if (dialog.open) dialog.close()
    }
  }, [])

  function handleCancel(event) {
    event.preventDefault()
    if (!bloqueado) onFechar()
  }

  function handleClick(event) {
    if (event.target === event.currentTarget && !bloqueado) onFechar()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-label={label}
      onCancel={handleCancel}
      onClick={handleClick}
      className={`m-auto max-h-[90vh] w-[calc(100%-2rem)] overflow-hidden rounded-xl border border-line bg-surface-muted p-0 text-ink shadow-xl backdrop:bg-black/50 ${className}`}
    >
      <div className="max-h-[90vh] overflow-y-auto">{children}</div>
    </dialog>
  )
}
