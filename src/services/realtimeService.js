import * as signalR from '@microsoft/signalr'
import { API_ORIGIN, TOKEN_KEY } from './api.js'

/**
 * Abre a conexão com o hub do quadro e registra os callbacks.
 * Falhas de conexão são silenciosas: o quadro continua funcionando pelas ações normais.
 * Retorna a função que encerra a conexão.
 */
export function conectarTempoReal({
  onTopicoAtualizado,
  onReconectado,
} = {}) {
  const conexao = new signalR.HubConnectionBuilder()
    .withUrl(`${API_ORIGIN}/hubs/quadro`, {
      accessTokenFactory: () => localStorage.getItem(TOKEN_KEY) ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build()

  conexao.on('TopicoAtualizado', (evento) => {
    onTopicoAtualizado?.(evento)
  })

  conexao.onreconnected(() => {
    onReconectado?.()
  })

  let encerrado = false

  async function iniciar() {
    try {
      await conexao.start()
    } catch {
      if (!encerrado) setTimeout(iniciar, 5000)
    }
  }

  iniciar()

  return () => {
    encerrado = true
    conexao.stop().catch(() => {})
  }
}
