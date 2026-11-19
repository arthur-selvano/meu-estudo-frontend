/**
 * Normaliza uma URL apenas se ela for absoluta e usar http/https.
 * Bloqueia esquemas ativos como javascript:, data:, vbscript: e file:,
 * que poderiam virar XSS ao serem colocados em um href.
 *
 * @param {unknown} valor
 * @returns {string|null}
 */
export function urlHttpSegura(valor) {
  if (typeof valor !== 'string') return null

  const texto = valor.trim()

  if (!texto || texto.length > 2048) return null

  try {
    const url = new URL(texto)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

    return url.href
  } catch {
    return null
  }
}
