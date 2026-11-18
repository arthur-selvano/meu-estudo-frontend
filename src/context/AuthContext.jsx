import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import {
  login as loginRequest,
  registrar as registrarRequest,
} from '../services/authService'
import { TOKEN_KEY, USUARIO_KEY, limparSessao } from '../services/api'

const AuthContext = createContext(null)

function sessaoValida(usuario) {
  return (
    typeof usuario?.nome === 'string' &&
    usuario.nome.trim() !== '' &&
    typeof usuario.email === 'string' &&
    usuario.email.trim() !== ''
  )
}

function lerSessaoInicial() {
  const token = localStorage.getItem(TOKEN_KEY)
  const usuarioJson = localStorage.getItem(USUARIO_KEY)

  if (!token || !usuarioJson) {
    limparSessao()
    return { token: null, usuario: null }
  }

  try {
    const usuario = JSON.parse(usuarioJson)

    if (!sessaoValida(usuario)) {
      throw new Error('Sessão inválida no localStorage')
    }

    return { token, usuario }
  } catch {
    limparSessao()
    return { token: null, usuario: null }
  }
}

export function AuthProvider({ children }) {
  const [{ token, usuario }, setSessao] = useState(lerSessaoInicial)

  const persistirSessao = useCallback((sessao) => {
    localStorage.setItem(TOKEN_KEY, sessao.token)
    localStorage.setItem(USUARIO_KEY, JSON.stringify(sessao.usuario))
    setSessao({ token: sessao.token, usuario: sessao.usuario })
  }, [])

  const login = useCallback(
    async ({ email, senha }) => {
      const sessao = await loginRequest({ email, senha })
      persistirSessao(sessao)
    },
    [persistirSessao],
  )

  const registrar = useCallback(
    async ({ nome, email, senha }) => {
      const sessao = await registrarRequest({ nome, email, senha })
      persistirSessao(sessao)
    },
    [persistirSessao],
  )

  const logout = useCallback(() => {
    limparSessao()
    setSessao({ token: null, usuario: null })
  }, [])

  const atualizarUsuario = useCallback((dadosParciais) => {
    setSessao((atual) => {
      if (!atual.usuario) return atual

      const usuarioAtualizado = { ...atual.usuario, ...dadosParciais }

      localStorage.setItem(USUARIO_KEY, JSON.stringify(usuarioAtualizado))

      return { ...atual, usuario: usuarioAtualizado }
    })
  }, [])

  const value = useMemo(
    () => ({ usuario, token, login, registrar, logout, atualizarUsuario }),
    [usuario, token, login, registrar, logout, atualizarUsuario],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- hook exposto junto do provider
export function useAuth() {
  const contexto = useContext(AuthContext)

  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return contexto
}
