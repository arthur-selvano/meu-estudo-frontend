import axios from 'axios'

export const TOKEN_KEY = 'token'
export const USUARIO_KEY = 'usuario'

/**
 * Instância única de comunicação com a API MeuEstudos.
 *
 * Observação: a API chama `UseHttpsRedirection()`. Rodando pelo perfil `http`
 * (porta 5123) o endereço abaixo funciona; pelo perfil `https`, troque a
 * baseURL para `https://localhost:7120/api`.
 */
export const api = axios.create({
  baseURL: 'http://localhost:5123/api',
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
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USUARIO_KEY)
      window.location.reload()
    }

    return Promise.reject(error)
  },
)
