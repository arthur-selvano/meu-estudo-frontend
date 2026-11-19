import { useState } from 'react'
import {
  Download,
  ExternalLink,
  FileText,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  Trash2,
} from 'lucide-react'
import Avatar from './Avatar'
import { API_ORIGIN } from '../services/api'
import {
  BOTAO_ICONE_PERIGO,
  BOTAO_SECUNDARIO,
  CAMPO,
  CARTAO,
} from '../styles/ui'
import { formatarDataHora } from '../utils/datas'
import {
  LIMITE_COMENTARIO,
  infoTipoPublicacao,
} from '../utils/publicacoes'

function BotaoAutor({ nome, autorId, onVerPerfil, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => onVerPerfil(autorId)}
      aria-label={`Ver perfil de ${nome}`}
      className={`max-w-full truncate rounded-sm text-left underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${className}`}
    >
      {nome}
    </button>
  )
}

export default function CardPublicacao({
  publicacao,
  usuario,
  curtindo,
  comentando,
  onCurtir,
  onComentar,
  onSolicitarExclusao,
  onVerPerfil,
}) {
  const [texto, setTexto] = useState('')
  const [comentariosAbertos, setComentariosAbertos] = useState(false)

  const info = infoTipoPublicacao(publicacao.tipo)
  const souAutor = publicacao.autorId === usuario.id
  const anexoUrl = publicacao.arquivoUrl
    ? `${API_ORIGIN}${publicacao.arquivoUrl}`
    : null

  async function handleComentar(event) {
    event.preventDefault()

    if (comentando || !texto.trim()) return

    const enviado = await onComentar(publicacao.id, texto.trim())

    if (enviado) setTexto('')
  }

  return (
    <article className={`${CARTAO} p-4 sm:p-5`}>
      <header className="flex items-center gap-2.5">
        <Avatar
          nome={publicacao.autorNome}
          fotoUrl={publicacao.autorFotoUrl}
          tamanho="sm"
        />

        <BotaoAutor
          nome={publicacao.autorNome}
          autorId={publicacao.autorId}
          onVerPerfil={onVerPerfil}
          className="min-w-0 truncate text-sm font-semibold text-ink"
        />

        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] tracking-wide uppercase ${info.classeBadge}`}
        >
          {info.rotulo}
        </span>

        <span className="ml-auto hidden shrink-0 text-xs text-ink-muted sm:inline">
          {formatarDataHora(publicacao.criadoEm)}
        </span>

        {souAutor && (
          <button
            type="button"
            onClick={() => onSolicitarExclusao(publicacao)}
            aria-label="Excluir publicação"
            title="Excluir publicação"
            className={`${BOTAO_ICONE_PERIGO} h-8 w-8 shrink-0`}
          >
            <Trash2 aria-hidden="true" size={15} />
          </button>
        )}
      </header>

      <div className="mt-3 space-y-2">
        {publicacao.titulo && (
          <h3 className="break-words text-base font-semibold leading-tight text-ink">
            {publicacao.titulo}
          </h3>
        )}

        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-secondary">
          {publicacao.conteudo}
        </p>

        {publicacao.linkUrl && (
          <a
            href={publicacao.linkUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-line-soft bg-surface-muted px-3 py-2 text-xs font-medium text-link transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25"
          >
            <ExternalLink aria-hidden="true" size={14} className="shrink-0" />
            <span className="truncate">{publicacao.linkUrl}</span>
          </a>
        )}

        {anexoUrl && (
          <a
            href={anexoUrl}
            target="_blank"
            rel="noreferrer noopener"
            download={publicacao.arquivoNome ?? undefined}
            className="inline-flex max-w-full items-center gap-2 rounded-lg border border-line-soft bg-surface-muted px-3 py-2 text-xs font-medium text-link transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25"
          >
            <FileText aria-hidden="true" size={14} className="shrink-0" />
            <span className="truncate">
              {publicacao.arquivoNome ?? 'Anexo'}
            </span>
            <Download aria-hidden="true" size={14} className="shrink-0" />
          </a>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
        <button
          type="button"
          onClick={() => onCurtir(publicacao.id)}
          disabled={curtindo}
          aria-pressed={publicacao.curtidoPorMim}
          aria-label={
            publicacao.curtidoPorMim
              ? 'Descurtir publicação'
              : 'Curtir publicação'
          }
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:opacity-60 ${
            publicacao.curtidoPorMim
              ? 'bg-danger-bg text-danger-ink hover:bg-danger-hover'
              : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
          }`}
        >
          {curtindo ? (
            <Loader2
              aria-hidden="true"
              size={15}
              className="motion-safe:animate-spin"
            />
          ) : (
            <Heart
              aria-hidden="true"
              size={15}
              className={publicacao.curtidoPorMim ? 'fill-current' : ''}
            />
          )}
          {publicacao.curtidas}
        </button>

        <button
          type="button"
          onClick={() => setComentariosAbertos((aberto) => !aberto)}
          aria-expanded={comentariosAbertos}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
        >
          <MessageCircle aria-hidden="true" size={15} />
          {publicacao.comentarios.length}{' '}
          {publicacao.comentarios.length === 1 ? 'comentário' : 'comentários'}
        </button>
      </div>

      {comentariosAbertos && (
        <>
          {publicacao.comentarios.length > 0 && (
            <ul className="mt-2 space-y-2.5 border-t border-line-faint pt-3">
          {publicacao.comentarios.map((comentario) => (
            <li key={comentario.id} className="flex items-start gap-2">
              <Avatar
                nome={comentario.autorNome}
                fotoUrl={comentario.autorFotoUrl}
                tamanho="xs"
              />
              <div className="min-w-0 flex-1 rounded-lg bg-surface-muted px-3 py-2">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <BotaoAutor
                    nome={comentario.autorNome}
                    autorId={comentario.autorId}
                    onVerPerfil={onVerPerfil}
                    className="text-xs font-semibold text-ink"
                  />
                  <span className="text-[11px] text-ink-muted">
                    {formatarDataHora(comentario.criadoEm)}
                  </span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink-secondary">
                  {comentario.conteudo}
                </p>
              </div>
            </li>
          ))}
        </ul>
          )}

          <form onSubmit={handleComentar} className="mt-3 flex gap-2">
        <label htmlFor={`comentario-${publicacao.id}`} className="sr-only">
          Comentar publicação de {publicacao.autorNome}
        </label>
        <input
          id={`comentario-${publicacao.id}`}
          type="text"
          maxLength={LIMITE_COMENTARIO}
          disabled={comentando}
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          placeholder="Escreva um comentário"
          className={`${CAMPO} min-w-0 flex-1 py-2 text-sm`}
        />
        <button
          type="submit"
          disabled={comentando || !texto.trim()}
          className={`${BOTAO_SECUNDARIO} min-h-10 shrink-0 px-3 py-2 text-xs`}
        >
          {comentando ? (
            <Loader2
              aria-hidden="true"
              size={14}
              className="motion-safe:animate-spin"
            />
          ) : (
            <Send aria-hidden="true" size={14} />
          )}
          <span className="hidden sm:inline">Comentar</span>
        </button>
          </form>
        </>
      )}
    </article>
  )
}
