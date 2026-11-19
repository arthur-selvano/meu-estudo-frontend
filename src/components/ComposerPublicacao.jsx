import { useRef, useState } from 'react'
import {
  FileText,
  GraduationCap,
  Link2,
  Loader2,
  MessagesSquare,
  Paperclip,
  Send,
  X,
} from 'lucide-react'
import Avatar from './Avatar'
import FeedbackBanner from './FeedbackBanner'
import {
  BOTAO_PRIMARIO,
  BOTAO_SECUNDARIO,
  CAMPO,
  CARTAO,
  ROTULO,
} from '../styles/ui'
import {
  EXTENSOES_ANEXO,
  LIMITE_CONTEUDO_PUBLICACAO,
  LIMITE_TITULO_PUBLICACAO,
  TAMANHO_MAXIMO_ANEXO,
  TIPOS_PUBLICACAO,
  formatarTamanhoArquivo,
  infoTipoPublicacao,
} from '../utils/publicacoes'

const ICONES = {
  ESTUDO: MessagesSquare,
  AULA: GraduationCap,
  LINK: Link2,
  DOCUMENTO: FileText,
}

const ESTADO_INICIAL = {
  tipo: 'ESTUDO',
  titulo: '',
  conteudo: '',
  linkUrl: '',
  arquivo: null,
}

export default function ComposerPublicacao({ usuario, publicando, onPublicar }) {
  const [tipo, setTipo] = useState(ESTADO_INICIAL.tipo)
  const [titulo, setTitulo] = useState(ESTADO_INICIAL.titulo)
  const [conteudo, setConteudo] = useState(ESTADO_INICIAL.conteudo)
  const [linkUrl, setLinkUrl] = useState(ESTADO_INICIAL.linkUrl)
  const [arquivo, setArquivo] = useState(ESTADO_INICIAL.arquivo)
  const [erro, setErro] = useState('')
  const arquivoRef = useRef(null)

  const info = infoTipoPublicacao(tipo)
  const mostraLink = tipo === 'LINK' || tipo === 'AULA'
  const mostraArquivo = tipo === 'DOCUMENTO' || tipo === 'AULA'

  function limpar() {
    setTipo(ESTADO_INICIAL.tipo)
    setTitulo(ESTADO_INICIAL.titulo)
    setConteudo(ESTADO_INICIAL.conteudo)
    setLinkUrl(ESTADO_INICIAL.linkUrl)
    setArquivo(ESTADO_INICIAL.arquivo)
    setErro('')

    if (arquivoRef.current) arquivoRef.current.value = ''
  }

  function handleArquivo(event) {
    const selecionado = event.target.files?.[0]

    if (!selecionado) return

    const extensao = selecionado.name
      .slice(selecionado.name.lastIndexOf('.'))
      .toLowerCase()

    if (!EXTENSOES_ANEXO.split(',').includes(extensao)) {
      setErro('Formato de anexo não suportado.')
      event.target.value = ''
      setArquivo(null)
      return
    }

    if (selecionado.size > TAMANHO_MAXIMO_ANEXO) {
      setErro('O anexo deve ter no máximo 10 MB.')
      event.target.value = ''
      setArquivo(null)
      return
    }

    setErro('')
    setArquivo(selecionado)
  }

  function removerArquivo() {
    setArquivo(null)
    if (arquivoRef.current) arquivoRef.current.value = ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (publicando) return

    if (!conteudo.trim()) {
      setErro('Escreva o conteúdo da publicação.')
      return
    }

    if (tipo === 'LINK' && !linkUrl.trim()) {
      setErro('Informe o link que você quer compartilhar.')
      return
    }

    if (tipo === 'DOCUMENTO' && !arquivo) {
      setErro('Selecione o documento que você quer disponibilizar.')
      return
    }

    const publicado = await onPublicar({
      tipo,
      titulo: tipo === 'ESTUDO' ? '' : titulo,
      conteudo,
      linkUrl: mostraLink ? linkUrl : '',
      arquivo: mostraArquivo ? arquivo : null,
    })

    if (publicado) limpar()
  }

  return (
    <section className={`${CARTAO} p-4 sm:p-5`}>
      <div className="flex items-center gap-3">
        <Avatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} tamanho="sm" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">Nova publicação</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div
          role="group"
          aria-label="Tipo de publicação"
          className="flex flex-wrap gap-1.5"
        >
          {TIPOS_PUBLICACAO.map((opcao) => {
            const Icone = ICONES[opcao.valor]
            const ativo = tipo === opcao.valor

            return (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => setTipo(opcao.valor)}
                aria-pressed={ativo}
                disabled={publicando}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:opacity-60 ${
                  ativo
                    ? opcao.classeBadge
                    : 'border-field-line bg-surface text-ink-soft hover:bg-surface-hover'
                }`}
              >
                <Icone aria-hidden="true" size={14} />
                {opcao.rotulo}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-ink-muted">{info.descricao}</p>

        {tipo !== 'ESTUDO' && (
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <label htmlFor="publicacao-titulo" className={`${ROTULO} mb-0`}>
                Título (opcional)
              </label>
              <span className="text-xs text-ink-muted">
                {titulo.length}/{LIMITE_TITULO_PUBLICACAO}
              </span>
            </div>
            <input
              id="publicacao-titulo"
              type="text"
              maxLength={LIMITE_TITULO_PUBLICACAO}
              disabled={publicando}
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Dê um título para o material"
              className={CAMPO}
            />
          </div>
        )}

        <div>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <label htmlFor="publicacao-conteudo" className={`${ROTULO} mb-0`}>
              {tipo === 'ESTUDO' ? 'O que você procura?' : 'Descrição'}
            </label>
            <span className="text-xs text-ink-muted">
              {conteudo.length}/{LIMITE_CONTEUDO_PUBLICACAO}
            </span>
          </div>
          <textarea
            id="publicacao-conteudo"
            rows={3}
            required
            maxLength={LIMITE_CONTEUDO_PUBLICACAO}
            disabled={publicando}
            value={conteudo}
            onChange={(event) => setConteudo(event.target.value)}
            placeholder={info.placeholder}
            className={`${CAMPO} resize-y`}
          />
        </div>

        {mostraLink && (
          <div>
            <label htmlFor="publicacao-link" className={ROTULO}>
              {tipo === 'LINK' ? 'Link' : 'Link da aula (opcional)'}
            </label>
            <div className="relative">
              <Link2
                aria-hidden="true"
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                id="publicacao-link"
                type="url"
                required={tipo === 'LINK'}
                maxLength={500}
                disabled={publicando}
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://..."
                className={`${CAMPO} pl-9`}
              />
            </div>
          </div>
        )}

        {mostraArquivo && (
          <div>
            <label htmlFor="publicacao-arquivo" className={ROTULO}>
              {tipo === 'DOCUMENTO' ? 'Documento' : 'Anexo (opcional)'}
            </label>
            <input
              ref={arquivoRef}
              id="publicacao-arquivo"
              type="file"
              accept={EXTENSOES_ANEXO}
              onChange={handleArquivo}
              disabled={publicando}
              className="sr-only"
            />

            {arquivo ? (
              <div className="flex items-center gap-2 rounded-lg border border-line-soft bg-surface-muted px-3 py-2">
                <FileText
                  aria-hidden="true"
                  size={16}
                  className="shrink-0 text-ink-faint"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{arquivo.name}</p>
                  <p className="text-xs text-ink-muted">
                    {formatarTamanhoArquivo(arquivo.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removerArquivo}
                  disabled={publicando}
                  aria-label="Remover anexo selecionado"
                  className="flex min-h-9 min-w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
                >
                  <X aria-hidden="true" size={16} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="publicacao-arquivo"
                className={`${BOTAO_SECUNDARIO} cursor-pointer px-3 py-2 text-sm ${
                  publicando ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                <Paperclip aria-hidden="true" size={16} />
                Selecionar arquivo
              </label>
            )}

            <p className="mt-1.5 text-xs text-ink-muted">
              PDF, DOC, DOCX, PPT, PPTX, TXT, MD ou imagem, até 10 MB.
            </p>
          </div>
        )}

        <FeedbackBanner
          tipo="erro"
          mensagem={erro}
          onFechar={() => setErro('')}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={publicando || !conteudo.trim()}
            aria-busy={publicando}
            className={`${BOTAO_PRIMARIO} min-h-11 w-full px-4 py-2.5 text-sm sm:w-auto`}
          >
            {publicando ? (
              <Loader2
                aria-hidden="true"
                size={16}
                className="motion-safe:animate-spin"
              />
            ) : (
              <Send aria-hidden="true" size={16} />
            )}
            {publicando ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </section>
  )
}
