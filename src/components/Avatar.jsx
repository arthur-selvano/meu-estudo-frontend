import { urlDaImagem } from '../utils/imagem'

const TAMANHOS = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-16 w-16 text-xl sm:h-24 sm:w-24 sm:text-3xl',
}

function iniciais(nome) {
  const partes = String(nome ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 1).toUpperCase()

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

export default function Avatar({
  nome,
  fotoUrl,
  tamanho = 'md',
  className = '',
}) {
  const url = urlDaImagem(fotoUrl)
  const dimensao = TAMANHOS[tamanho] ?? TAMANHOS.md

  if (url) {
    return (
      <img
        src={url}
        alt={`Foto de ${nome}`}
        loading="lazy"
        className={`shrink-0 rounded-full border border-line-soft object-cover ${dimensao} ${className}`}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={`Foto de ${nome}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-on-primary ${dimensao} ${className}`}
    >
      {iniciais(nome)}
    </span>
  )
}
