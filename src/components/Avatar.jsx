import { urlDaImagem } from '../utils/imagem'

const TAMANHOS = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
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
        className={`shrink-0 rounded-full border border-[#DCE3D8] object-cover ${dimensao} ${className}`}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={`Foto de ${nome}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#173D2E] font-semibold text-[#F4F6F0] ${dimensao} ${className}`}
    >
      {iniciais(nome)}
    </span>
  )
}
