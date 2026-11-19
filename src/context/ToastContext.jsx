import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import ToastViewport from '../components/ToastViewport'
import { adicionarToast, removerToast } from '../utils/toasts'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const proximoId = useRef(0)

  const mostrar = useCallback((tipo, mensagem) => {
    proximoId.current += 1

    setToasts((atuais) =>
      adicionarToast(atuais, {
        id: `toast-${proximoId.current}`,
        tipo,
        mensagem,
      }),
    )
  }, [])

  const mostrarSucesso = useCallback(
    (mensagem) => mostrar('sucesso', mensagem),
    [mostrar],
  )

  const mostrarErro = useCallback(
    (mensagem) => mostrar('erro', mensagem),
    [mostrar],
  )

  const remover = useCallback((id) => {
    setToasts((atuais) => removerToast(atuais, id))
  }, [])

  const value = useMemo(
    () => ({ mostrarSucesso, mostrarErro }),
    [mostrarSucesso, mostrarErro],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onFechar={remover} />
    </ToastContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components -- hook exposto junto do provider
export function useToast() {
  const contexto = useContext(ToastContext)

  if (!contexto) {
    throw new Error('useToast deve ser usado dentro de ToastProvider')
  }

  return contexto
}
