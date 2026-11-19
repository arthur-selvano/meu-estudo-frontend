import { useRef, useState } from 'react'
import { CalendarDays, ListChecks, MoreVertical, UserRound } from 'lucide-react'
import Avatar from './Avatar'
import PrioridadeBadge from './PrioridadeBadge'
import { dataEstaVencida, formatarDataSimples } from '../utils/datas'
import {
  TIPO_TRABALHO_ACADEMICO,
  calcularOrdemMover,
  ehColunaConcluida,
  idColunaDoTopico,
  topicosDaColuna,
} from '../utils/quadro'

const CORES_COLUNA = ['bg-ink-faint']

function ResponsavelCartao({ topico, participantes }) {
  const responsavel = participantes.find(
    (pessoa) => pessoa.id === topico.responsavelId,
  )
  const nome = responsavel?.nome ?? topico.responsavelNome ?? null
  const fotoUrl = responsavel?.fotoUrl ?? topico.responsavelFotoUrl ?? null

  return (
    <div className="mt-3 flex items-center gap-1.5 border-t border-line-faint pt-2.5">
      {nome ? (
        <Avatar nome={nome} fotoUrl={fotoUrl} tamanho="xs" />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-line bg-surface text-ink-faint"
        >
          <UserRound size={10} />
        </span>
      )}

      <span className="truncate text-[11px] text-ink-muted">
        {nome ?? 'Sem responsável'}
      </span>
    </div>
  )
}

function ContadorSubtarefas({ detalhe }) {
  const subtarefas = detalhe?.subtarefas ?? []

  if (subtarefas.length === 0) return null

  const concluidas = subtarefas.filter((subtarefa) => subtarefa.concluida).length

  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-ink-muted">
      <ListChecks aria-hidden="true" size={12} />
      {concluidas}/{subtarefas.length}
    </span>
  )
}

function CartaoTopico({
  topico,
  tipo,
  participantes,
  colunas,
  colunaAtualId,
  colunaConcluida,
  arrastando,
  movendo,
  detalhe,
  onAbrir,
  onDragStart,
  onDragEnd,
  onMover,
}) {
  const [menuAberto, setMenuAberto] = useState(false)

  const vencido =
    !colunaConcluida && dataEstaVencida(topico.dataPrevista)
  const destinos = colunas.filter((coluna) => coluna.id !== colunaAtualId)

  function moverPara(colunaId) {
    setMenuAberto(false)
    onMover(colunaId)
  }

  return (
    <article
      data-topico-id={topico.id}
      tabIndex={-1}
      draggable={!movendo}
      onDragStart={(event) => onDragStart(event, topico)}
      onDragEnd={onDragEnd}
      onClick={(event) => {
        if (event.target.closest('select, button, a, input, label')) return
        onAbrir?.(topico)
      }}
      className={`min-w-0 rounded-md border border-line bg-surface p-4 focus:outline-none focus:ring-2 focus:ring-brand/25 ${
        arrastando ? 'opacity-50' : ''
      } ${movendo ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex items-start gap-2">
        <PrioridadeBadge prioridade={topico.prioridade} />
        <ContadorSubtarefas detalhe={detalhe} />

        <div
          className="relative ml-auto shrink-0"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setMenuAberto(false)
            }
          }}
        >
          <button
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-label={`Ações de ${topico.titulo}`}
            aria-expanded={menuAberto}
            className="flex h-7 w-7 items-center justify-center rounded text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
          >
            <MoreVertical aria-hidden="true" size={15} />
          </button>

          {menuAberto && (
            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-line bg-surface p-1">
              <p className="px-2 py-1 text-[10px] font-medium tracking-wide text-ink-muted uppercase">
                Mover para
              </p>

              {destinos.length === 0 ? (
                <p className="px-2 py-1 text-xs text-ink-faint">
                  Sem outras colunas
                </p>
              ) : (
                destinos.map((coluna) => (
                  <button
                    key={coluna.id}
                    type="button"
                    onClick={() => moverPara(coluna.id)}
                    className="flex w-full items-center rounded px-2 py-1.5 text-left text-xs text-ink-soft transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
                  >
                    {coluna.titulo}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <h4 className="mt-2.5">
        <button
          type="button"
          onClick={() => onAbrir?.(topico)}
          className={`break-words text-left text-base font-medium leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 ${
            colunaConcluida
              ? 'text-ink-muted line-through'
              : 'text-ink'
          }`}
        >
          {topico.titulo}
        </button>
      </h4>

      {topico.descricao && (
        <p className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-ink-muted">
          {topico.descricao}
        </p>
      )}

      {topico.dataPrevista && (
        <p
          className={`mt-2 flex items-center gap-1 text-xs ${
            vencido
              ? 'font-medium text-danger-ink'
              : 'text-ink-muted'
          }`}
        >
          <CalendarDays aria-hidden="true" size={12} />
          {formatarDataSimples(topico.dataPrevista)}
          {vencido && <span className="sr-only">(prazo vencido)</span>}
        </p>
      )}

      {tipo === TIPO_TRABALHO_ACADEMICO && (
        <ResponsavelCartao topico={topico} participantes={participantes} />
      )}
    </article>
  )
}

function ListaTopicos({ topicos, colunas, detalhes, onAbrirDetalhe }) {
  if (topicos.length === 0) {
    return <p className="py-6 text-sm text-ink-muted">Nenhum card no quadro.</p>
  }

  return (
    <div className="space-y-5">
      {colunas.map((coluna) => {
        const cards = topicosDaColuna(topicos, coluna.id, colunas)
        const concluida = ehColunaConcluida(coluna, colunas)

        return (
          <section key={coluna.id}>
            <div className="flex items-center justify-between border-b border-line pb-1.5">
              <h3 className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                {coluna.titulo}
              </h3>
              <span className="text-xs text-ink-faint">{cards.length}</span>
            </div>

            {cards.length === 0 ? (
              <p className="py-3 text-xs text-ink-faint">Nenhum card.</p>
            ) : (
              <ul className="divide-y divide-line-faint">
                {cards.map((topico) => {
                  const vencido =
                    !concluida && dataEstaVencida(topico.dataPrevista)

                  return (
                    <li key={topico.id}>
                      <button
                        type="button"
                        onClick={() => onAbrirDetalhe?.(topico)}
                        className="flex w-full items-center gap-3 px-1 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
                      >
                        <span
                          className={`min-w-0 flex-1 truncate text-sm ${
                            concluida
                              ? 'text-ink-muted line-through'
                              : 'text-ink'
                          }`}
                        >
                          {topico.titulo}
                        </span>

                        <ContadorSubtarefas detalhe={detalhes[topico.id]} />

                        {topico.dataPrevista && (
                          <span
                            className={`shrink-0 text-xs ${
                              vencido ? 'text-danger-ink' : 'text-ink-muted'
                            }`}
                          >
                            {formatarDataSimples(topico.dataPrevista)}
                          </span>
                        )}

                        <PrioridadeBadge prioridade={topico.prioridade} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

function CronogramaTopicos({ topicos, colunas, detalhes, onAbrirDetalhe }) {
  const colunaDoTopico = (topico) =>
    colunas.find((coluna) => coluna.id === idColunaDoTopico(topico, colunas))

  const comData = topicos
    .filter((topico) => topico.dataPrevista)
    .sort((a, b) => String(a.dataPrevista).localeCompare(String(b.dataPrevista)))

  const semData = topicos.filter((topico) => !topico.dataPrevista)

  function Linha({ topico }) {
    const coluna = colunaDoTopico(topico)
    const concluida = ehColunaConcluida(coluna, colunas)
    const vencido =
      !concluida && dataEstaVencida(topico.dataPrevista)

    return (
      <li className="flex gap-3">
        <span
          className={`w-20 shrink-0 pt-2 text-right text-xs ${
            vencido ? 'font-medium text-danger-ink' : 'text-ink-muted'
          }`}
        >
          {topico.dataPrevista
            ? formatarDataSimples(topico.dataPrevista)
            : 'Sem data'}
        </span>

        <button
          type="button"
          onClick={() => onAbrirDetalhe?.(topico)}
          className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
        >
          <span
            className={`block truncate text-sm ${
              concluida ? 'text-ink-muted line-through' : 'text-ink'
            }`}
          >
            {topico.titulo}
          </span>

          <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span>{coluna?.titulo ?? 'Sem coluna'}</span>
            <ContadorSubtarefas detalhe={detalhes[topico.id]} />
            <PrioridadeBadge prioridade={topico.prioridade} />
          </span>
        </button>
      </li>
    )
  }

  return (
    <div className="space-y-5">
      <section>
        <h3 className="border-b border-line pb-1.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Com prazo
        </h3>

        {comData.length === 0 ? (
          <p className="py-3 text-xs text-ink-faint">Nenhum card com prazo.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {comData.map((topico) => (
              <Linha key={topico.id} topico={topico} />
            ))}
          </ul>
        )}
      </section>

      {semData.length > 0 && (
        <section>
          <h3 className="border-b border-line pb-1.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Sem prazo
          </h3>
          <ul className="mt-2 space-y-2">
            {semData.map((topico) => (
              <Linha key={topico.id} topico={topico} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default function QuadroKanban({
  topicos = [],
  colunas = [],
  tipo,
  participantes = [],
  movendo = false,
  visao = 'quadro',
  detalhes = {},
  onAbrirDetalhe,
  onMover,
}) {
  const [arrastandoId, setArrastandoId] = useState(null)
  const [colunaSobre, setColunaSobre] = useState(null)
  const raizRef = useRef(null)

  async function onMoverPeloSeletor(topicoId, colunaId) {
    if (movendo) return

    const ordem = calcularOrdemMover(topicos, topicoId, colunaId, colunas)
    const movido = await onMover(topicoId, colunaId, ordem)

    if (movido === false) return

    requestAnimationFrame(() => {
      const card = raizRef.current?.querySelector(
        `[data-topico-id="${CSS.escape(topicoId)}"]`,
      )

      card?.focus()
    })
  }

  function handleDragStart(event, topico) {
    if (movendo || event.defaultPrevented) {
      event.preventDefault()
      return
    }

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', topico.id)
    setArrastandoId(topico.id)
  }

  function handleDragEnd() {
    setArrastandoId(null)
    setColunaSobre(null)
  }

  function handleDragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  function handleDragLeave(event, colunaId) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setColunaSobre((atual) => (atual === colunaId ? null : atual))
    }
  }

  function handleDrop(event, coluna) {
    event.preventDefault()

    const topicoId =
      event.dataTransfer.getData('text/plain') || arrastandoId

    setArrastandoId(null)
    setColunaSobre(null)

    if (!topicoId || movendo) return

    const topico = topicos.find((item) => item.id === topicoId)

    if (!topico) return

    // Soltar na própria coluna não precisa de chamada à API.
    if (idColunaDoTopico(topico, colunas) === coluna.id) return

    onMover(
      topicoId,
      coluna.id,
      calcularOrdemMover(topicos, topicoId, coluna.id, colunas),
    )
  }

  if (visao === 'lista') {
    return (
      <ListaTopicos
        topicos={topicos}
        colunas={colunas}
        detalhes={detalhes}
        onAbrirDetalhe={onAbrirDetalhe}
      />
    )
  }

  if (visao === 'cronograma') {
    return (
      <CronogramaTopicos
        topicos={topicos}
        colunas={colunas}
        detalhes={detalhes}
        onAbrirDetalhe={onAbrirDetalhe}
      />
    )
  }

  return (
    <div
      ref={raizRef}
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 scroll-smooth"
    >
      {colunas.map((coluna, indice) => {
        const cards = topicosDaColuna(topicos, coluna.id, colunas)
        const sobre = colunaSobre === coluna.id
        const concluida = ehColunaConcluida(coluna, colunas)
        const tituloId = `coluna-${coluna.id}`

        return (
          <section
            key={coluna.id}
            aria-labelledby={tituloId}
            onDragOver={handleDragOver}
            onDragEnter={() => {
              if (arrastandoId) setColunaSobre(coluna.id)
            }}
            onDragLeave={(event) => handleDragLeave(event, coluna.id)}
            onDrop={(event) => handleDrop(event, coluna)}
            className={`flex min-h-64 w-80 min-w-[280px] shrink-0 snap-start flex-col rounded-md border transition-colors ${
              sobre
                ? 'border-ink/30 bg-surface-hover'
                : 'border-line bg-surface-muted'
            }`}
          >
            <header className="flex items-center justify-between gap-2 border-b border-line-soft px-3 py-2.5">
              <h3
                id={tituloId}
                className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink-soft"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    CORES_COLUNA[indice % CORES_COLUNA.length]
                  }`}
                />
                <span className="truncate">{coluna.titulo}</span>
              </h3>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-muted">
                {cards.length}
              </span>
            </header>

            <ul className="flex flex-1 flex-col gap-2.5 p-2.5">
              {cards.length === 0 ? (
                <li className="flex flex-1 items-center justify-center rounded-md border border-dashed border-line-faint px-3 py-8 text-center text-xs text-ink-faint">
                  {sobre ? 'Solte o card aqui' : 'Nenhum card'}
                </li>
              ) : (
                cards.map((topico) => (
                  <li key={topico.id} className="min-w-0">
                    <CartaoTopico
                      topico={topico}
                      tipo={tipo}
                      participantes={participantes}
                      colunas={colunas}
                      colunaAtualId={coluna.id}
                      colunaConcluida={concluida}
                      arrastando={arrastandoId === topico.id}
                      movendo={movendo}
                      detalhe={detalhes[topico.id]}
                      onAbrir={onAbrirDetalhe}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onMover={(destinoId) =>
                        onMoverPeloSeletor(topico.id, destinoId)
                      }
                    />
                  </li>
                ))
              )}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
