import { api } from './api.js'

/**
 * Autentica o usuário.
 * @param {{ email: string, senha: string }} credenciais
 * @returns {Promise<{ token: string, usuario: { id: string, nome: string, email: string, fotoUrl?: string|null } }>}
 */
export async function login(credenciais) {
  const { data } = await api.post('/auth/login', credenciais)
  return data
}

/**
 * Cadastra um novo usuário e devolve a sessão já autenticada.
 * @param {{ nome: string, email: string, senha: string }} dados
 * @returns {Promise<{ token: string, usuario: { id: string, nome: string, email: string, fotoUrl?: string|null } }>}
 */
export async function registrar(dados) {
  const { data } = await api.post('/auth/registrar', dados)
  return data
}
