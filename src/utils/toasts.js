export const MAX_TOASTS = 3

export const DURACAO_TOAST = {
  sucesso: 4000,
  erro: 6000,
}

export function adicionarToast(toasts, toast) {
  return [...toasts, toast].slice(-MAX_TOASTS)
}

export function removerToast(toasts, id) {
  return toasts.filter((toast) => toast.id !== id)
}
