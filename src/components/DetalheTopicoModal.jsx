import { useState } from 'react'
import {
  CalendarDays,
  Check,
  Columns3,
  ExternalLink,
  ListChecks,
  Plus,
  Send,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import Avatar from './Avatar'
import Modal from './Modal'
import PrioridadeBadge from './PrioridadeBadge'
import { BOTAO_ICONE_PERIGO, BOTAO_SECUNDARIO, CAMPO } from '../styles/ui'
import { formatarDataHora, formatarDataSimples } from '../utils/datas'
import {
  adicionarComentario,
  adicionarLink,
  adicionarSubtarefa,
  alternarSubtarefa,
  obterDetalhe,
  removerLink,
  removerSubtarefa,
} from '../services/topicoDetalheService'
import { TIPO_TRABALHO_ACADEMICO } from '../utils/quadro'
import { urlHttpSegura } from '../utils/urls'

export default function DetalheTopicoModal({
  topico,
  tipo,
  colunas = [],
  colunaAtualId = '',
  onMoverColuna = () => {},
  participantes = [],
  alterandoResponsavel = false,
  onAlterarResponsavel = () => {},
  usuario,
  onFechar,
  onDetalheAtualizado,
}) {
  const [detalhe, setDetalhe] = useState(() => obterDetalhe(topico.id))
  const [novaSubtarefa, setNovaSubtarefa] = useState('')
  const [linkTitulo, setLinkTitulo] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [erroLink, setErroLink] = useState('')
  const [comentario, setComentario] = useState('')
  const [linkFormAberto, setLinkFormAberto] = useState(false)
  const [aba, setAba] = useState('comentarios')

  const concluidas = detalhe.subtarefas.filter(
    (subtarefa) => subtarefa.concluida,
  ).length

  async function atualizar(promessa) {
    const atualizado = await promessa

    setDetalhe({ ...atualizado })
    onDetalheAtualizado?.(topico.id, atualizado)
  }

  async function handleAdicionarSubtarefa(event) {
    event.preventDefault()

    const titulo = novaSubtarefa.trim()

    if (!titulo) return

    await atualizar(adicionarSubtarefa(topico.id, titulo, usuario.nome))
    setNovaSubtarefa('')
  }

  async function handleAdicionarLink(event) {
    event.preventDefault()

    const titulo = linkTitulo.trim()
    const url = urlHttpSegura(linkUrl)

    if (!titulo) return

    if (!url) {
      setErroLink('Informe um link http:// ou https:// válido.')
      return
    }

    setErroLink('')
    await atualizar(adicionarLink(topico.id, { titulo, url }, usuario.nome))
    setLinkTitulo('')
    setLinkUrl('')
    setLinkFormAberto(false)
  }

  async function handleComentar(event) {
    event.preventDefault()

    const texto = comentario.trim()

    if (!texto) return

    await atualizar(
      adicionarComentario(topico.id, texto, {
        id: usuario.id,
        nome: usuario.nome,
      }),
    )
    setComentario('')
  }

  return (
    <Modal
      labelledBy="titulo-detalhe-topico"
      onFechar={onFechar}
      className="max-w-xl"
    >
      <div className="sticky top-0 z-10 border-b border-line bg-surface px-4 py-2.5 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-ink-muted">Detalhes do card</p>
            <h2
              id="titulo-detalhe-topico"
              className="mt-0.5 break-words text-base font-semibold text-ink"
            >
              {topico.titulo}
            </h2>

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <PrioridadeBadge prioridade={topico.prioridade} />

              {topico.dataPrevista && (
                <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                  <CalendarDays aria-hidden="true" size={12} />
                  {formatarDataSimples(topico.dataPrevista)}
                </span>
              )}

              <label className="inline-flex items-center gap-1 text-xs text-ink-muted">
                <Columns3 aria-hidden="true" size={12} />
                <span className="sr-only">Coluna</span>
                <select
                  value={colunaAtualId ?? ''}
                  onChange={(event) => {
                    if (event.target.value) onMoverColuna(event.target.value)
                  }}
                  className="max-w-[9rem] rounded border border-line bg-surface px-1 py-0.5 text-xs text-ink-soft outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                >
                  {colunas.map((coluna) => (
                    <option key={coluna.id} value={coluna.id}>
                      {coluna.titulo}
                    </option>
                  ))}
                </select>
              </label>

              {tipo === TIPO_TRABALHO_ACADEMICO && (
                <label className="inline-flex items-center gap-1 text-xs text-ink-muted">
                  <UserRound aria-hidden="true" size={12} />
                  <span className="sr-only">Responsável</span>
                  <select
                    value={topico.responsavelId ?? ''}
                    disabled={alterandoResponsavel}
                    onChange={(event) =>
                      onAlterarResponsavel(event.target.value || null)
                    }
                    className="max-w-[9rem] rounded border border-line bg-surface px-1 py-0.5 text-xs text-ink-soft outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-60"
                  >
                    <option value="">Sem responsável</option>
                    {participantes.map((pessoa) => (
                      <option key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {topico.descricao && (
              <p className="mt-1.5 line-clamp-2 break-words text-xs text-ink-secondary">
                {topico.descricao}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar detalhes do card"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-3 sm:px-5">
        <section>
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <ListChecks aria-hidden="true" size={14} />
              Subtarefas
            </h3>
            <span className="text-[11px] text-ink-muted">
              {concluidas}/{detalhe.subtarefas.length}
            </span>
          </div>

          {detalhe.subtarefas.length === 0 ? (
            <p className="mt-1 text-xs text-ink-muted">Nenhuma subtarefa.</p>
          ) : (
            <ul className="mt-1 space-y-0.5">
              {detalhe.subtarefas.map((subtarefa) => (
                <li
                  key={subtarefa.id}
                  className="group flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-surface-hover"
                >
                  <button
                    type="button"
                    onClick={() =>
                      atualizar(
                        alternarSubtarefa(
                          topico.id,
                          subtarefa.id,
                          usuario.nome,
                        ),
                      )
                    }
                    aria-pressed={subtarefa.concluida}
                    aria-label={`${subtarefa.concluida ? 'Reabrir' : 'Concluir'} ${subtarefa.titulo}`}
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 ${
                      subtarefa.concluida
                        ? 'border-brand bg-brand text-on-primary'
                        : 'border-field-line bg-surface'
                    }`}
                  >
                    {subtarefa.concluida && (
                      <Check aria-hidden="true" size={10} />
                    )}
                  </button>

                  <span
                    className={`min-w-0 flex-1 truncate text-xs ${
                      subtarefa.concluida
                        ? 'text-ink-muted line-through'
                        : 'text-ink'
                    }`}
                  >
                    {subtarefa.titulo}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      atualizar(
                        removerSubtarefa(
                          topico.id,
                          subtarefa.id,
                          usuario.nome,
                        ),
                      )
                    }
                    aria-label={`Remover ${subtarefa.titulo}`}
                    className={`${BOTAO_ICONE_PERIGO} h-5 w-5 opacity-0 group-hover:opacity-100`}
                  >
                    <Trash2 aria-hidden="true" size={11} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form
            onSubmit={handleAdicionarSubtarefa}
            className="mt-1 flex items-center gap-1 border-t border-line-faint pt-1.5"
          >
            <input
              type="text"
              value={novaSubtarefa}
              onChange={(event) => setNovaSubtarefa(event.target.value)}
              placeholder="Adicionar subtarefa"
              aria-label="Nova subtarefa"
              className="min-w-0 flex-1 rounded-sm bg-transparent px-1 py-1 text-xs text-ink outline-none placeholder:text-ink-faint focus-visible:ring-2 focus-visible:ring-brand/20"
            />
            <button
              type="submit"
              disabled={!novaSubtarefa.trim()}
              aria-label="Adicionar subtarefa"
              className="flex h-6 w-6 items-center justify-center rounded text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-40"
            >
              <Plus aria-hidden="true" size={13} />
            </button>
          </form>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-ink">Links</h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {detalhe.links.map((link) => (
              <span
                key={link.id}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-xs"
              >
                <a
                  href={urlHttpSegura(link.url) ?? undefined}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-w-0 items-center gap-1 text-link hover:underline"
                >
                  <ExternalLink aria-hidden="true" size={11} className="shrink-0" />
                  <span className="max-w-[12rem] truncate">{link.titulo}</span>
                </a>
                <button
                  type="button"
                  onClick={() =>
                    atualizar(removerLink(topico.id, link.id, usuario.nome))
                  }
                  aria-label={`Remover ${link.titulo}`}
                  className="shrink-0 text-ink-faint transition-colors hover:text-danger-ink"
                >
                  <X aria-hidden="true" size={11} />
                </button>
              </span>
            ))}

            {detalhe.links.length === 0 && !linkFormAberto && (
              <span className="text-xs text-ink-muted">Nenhum link.</span>
            )}

            <button
              type="button"
              onClick={() => setLinkFormAberto((aberto) => !aberto)}
              aria-expanded={linkFormAberto}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-field-line px-2 py-0.5 text-xs text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
            >
              <Plus aria-hidden="true" size={11} />
              Link
            </button>
          </div>

          {linkFormAberto && (
            <form
              onSubmit={handleAdicionarLink}
              className="mt-2 flex flex-col gap-1.5 sm:flex-row"
            >
              <input
                type="text"
                required
                value={linkTitulo}
                onChange={(event) => setLinkTitulo(event.target.value)}
                placeholder="Título"
                aria-label="Título do link"
                className={`${CAMPO} min-w-0 flex-1 py-1.5 text-xs`}
              />
              <input
                type="url"
                required
                maxLength={500}
                value={linkUrl}
                onChange={(event) => {
                  setLinkUrl(event.target.value)
                  setErroLink('')
                }}
                placeholder="https://..."
                aria-label="URL do link"
                className={`${CAMPO} min-w-0 flex-1 py-1.5 text-xs`}
              />
              <button
                type="submit"
                disabled={!linkTitulo.trim() || !linkUrl.trim()}
                className={`${BOTAO_SECUNDARIO} h-8 shrink-0 px-2.5 text-xs`}
              >
                <Plus aria-hidden="true" size={13} />
              </button>
              {erroLink && (
                <p role="alert" className="text-xs text-danger-ink">
                  {erroLink}
                </p>
              )}
            </form>
          )}
        </section>

        <section className="border-t border-line pt-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAba('comentarios')}
              aria-pressed={aba === 'comentarios'}
              className={`flex h-7 items-center gap-1 rounded px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 ${
                aba === 'comentarios'
                  ? 'bg-surface-hover text-ink'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Comentários
              <span className="text-ink-faint">
                {detalhe.comentarios.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAba('atividade')}
              aria-pressed={aba === 'atividade'}
              className={`flex h-7 items-center gap-1 rounded px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 ${
                aba === 'atividade'
                  ? 'bg-surface-hover text-ink'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Atividade
              <span className="text-ink-faint">
                {detalhe.atividades.length}
              </span>
            </button>
          </div>

          {aba === 'comentarios' ? (
            <div className="mt-2">
              {detalhe.comentarios.length === 0 ? (
                <p className="text-xs text-ink-muted">Nenhum comentário.</p>
              ) : (
                <ul className="space-y-1.5">
                  {detalhe.comentarios.map((item) => (
                    <li key={item.id} className="flex items-start gap-2">
                      <Avatar nome={item.autorNome} tamanho="xs" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-xs font-medium text-ink">
                            {item.autorNome}
                          </span>
                          <span className="text-[10px] text-ink-muted">
                            {formatarDataHora(item.criadoEm)}
                          </span>
                        </div>
                        <p className="break-words text-xs text-ink-secondary">
                          {item.texto}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleComentar} className="mt-2 flex gap-1.5">
                <input
                  type="text"
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                  placeholder="Comentar"
                  aria-label="Comentário"
                  className={`${CAMPO} min-w-0 flex-1 py-1.5 text-xs`}
                />
                <button
                  type="submit"
                  disabled={!comentario.trim()}
                  aria-label="Enviar comentário"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-40"
                >
                  <Send aria-hidden="true" size={13} />
                </button>
              </form>
            </div>
          ) : detalhe.atividades.length === 0 ? (
            <p className="mt-2 text-[11px] text-ink-muted">Nenhuma atividade.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink-muted">
              {detalhe.atividades.map((atividade) => (
                <li key={atividade.id}>
                  <span className="font-medium text-ink-soft">
                    {atividade.autorNome}
                  </span>{' '}
                  {atividade.texto}{' '}
                  <span className="text-ink-faint">
                    · {formatarDataHora(atividade.criadoEm)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  )
}
