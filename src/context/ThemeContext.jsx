import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  TEMA_CLARO,
  TEMA_ESCURO,
  TEMA_KEY,
  proximoTema,
  resolverTemaInicial,
  temaValido,
} from '../utils/tema'

const PREFERE_ESCURO = '(prefers-color-scheme: dark)'

function sistemaPrefereEscuro() {
  return window.matchMedia(PREFERE_ESCURO).matches
}

function lerEstadoInicial() {
  let salvo = null

  try {
    salvo = localStorage.getItem(TEMA_KEY)
  } catch {
    salvo = null
  }

  return {
    tema: resolverTemaInicial(salvo, sistemaPrefereEscuro()),
    seguirSistema: !temaValido(salvo),
  }
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [{ tema, seguirSistema }, setEstado] = useState(lerEstadoInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === TEMA_ESCURO)
  }, [tema])

  useEffect(() => {
    if (!seguirSistema) return undefined

    const media = window.matchMedia(PREFERE_ESCURO)

    function aoMudar(event) {
      setEstado((atual) =>
        atual.seguirSistema
          ? { ...atual, tema: event.matches ? TEMA_ESCURO : TEMA_CLARO }
          : atual,
      )
    }

    media.addEventListener('change', aoMudar)
    return () => media.removeEventListener('change', aoMudar)
  }, [seguirSistema])

  useEffect(() => {
    if (seguirSistema) return

    try {
      localStorage.setItem(TEMA_KEY, tema)
    } catch {
      // Persistência indisponível: o tema continua válido para a sessão.
    }
  }, [tema, seguirSistema])

  const alternarTema = useCallback(() => {
    setEstado((atual) => ({
      tema: proximoTema(atual.tema),
      seguirSistema: false,
    }))
  }, [])

  const value = useMemo(
    () => ({ tema, alternarTema }),
    [tema, alternarTema],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components -- hook exposto junto do provider
export function useTheme() {
  const contexto = useContext(ThemeContext)

  if (!contexto) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }

  return contexto
}
