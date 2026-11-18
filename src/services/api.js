import axios from 'axios'

export const TOKEN_KEY = 'token'
export const USUARIO_KEY = 'usuario'

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || 'http://localhost:5123/api'

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USUARIO_KEY)
}

export function mensagemDeErro(
  err,
  fallback = 'Não foi possível concluir a ação. Tente novamente.',
) {
  return err?.response?.data?.erro || fallback
}

/**
 * Instância única de comunicação com a API MeuEstudos.
 *
 * A URL pode ser sobrescrita por `VITE_API_URL`. O padrão assume o perfil
 * `http` da API em `http://localhost:5123`.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      limparSessao()
      window.location.reload()
    }

    return Promise.reject(error)
  },
)
