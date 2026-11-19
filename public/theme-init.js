/*
 * Aplica o tema antes do React montar, evitando o flash de tema incorreto.
 * Fica em arquivo externo para que a CSP possa usar script-src 'self'
 * (sem 'unsafe-inline').
 */
try {
  const salvo = localStorage.getItem('tema')
  const valido = salvo === 'claro' || salvo === 'escuro'
  const escuro = valido
    ? salvo === 'escuro'
    : matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', escuro)
} catch {}
