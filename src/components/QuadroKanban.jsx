import { useRef, useState } from 'react'
import { CalendarDays, GripVertical, UserRound } from 'lucide-react'
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

const CORES_COLUNA = [
  'bg-ink-faint',
  'bg-amber',
  'bg-info',
  'bg-brand',
]

function SeletorResponsavel({
  topico,
  participantes,
  desabilitado,
  onAlterarResponsavel,
}) {
  const responsavel = participantes.find(
    (pessoa) => pessoa.id === topico.responsavelId,
  )
  const nome = responsavel?.nome ?? topico.responsavelNome ?? null
  const fotoUrl = responsavel?.fotoUrl ?? topico.responsavelFotoUrl ?? null

  return (
    <div
      className="mt-2.5 border-t border-line-faint pt-2.5"
      onDragStart={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <div className="flex items-center gap-2">
        {nome ? (
          <Avatar nome={nome} fotoUrl={fotoUrl} tamanho="xs" />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-line bg-surface text-ink-faint"
          >
            <UserRound size={12} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-ink-soft">
            {nome ?? 'Sem responsável'}
          </p>

          <label htmlFor={`responsavel-${topico.id}`} className="sr-only">
            Alterar responsável de {topico.titulo}
          </label>
          <select
            id={`responsavel-${topico.id}`}
            value={topico.responsavelId ?? ''}
            disabled={desabilitado}
            onChange={(event) =>
              onAlterarResponsavel(event.target.value || null)
            }
            className="mt-0.5 min-h-11 w-full rounded-md border border-field-line bg-surface px-1.5 py-1 text-[11px] text-ink-soft outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-wait disabled:opacity-60"
          >
            <option value="">Sem responsável</option>
            {participantes.map((pessoa) => (
              <option key={pessoa.id} value={pessoa.id}>
                {pessoa.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

function SeletorMover({ topico, colunaAtualId, colunas, desabilitado, onMover }) {
  const destinos = colunas.filter((coluna) => coluna.id !== colunaAtualId)

  if (destinos.length === 0) return null

  return (
    <div
      className="mt-2.5 border-t border-line-faint pt-2.5"
      onDragStart={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <label htmlFor={`mover-${topico.id}`} className="sr-only">
        Mover {topico.titulo} para outra coluna
      </label>
      <select
        id={`mover-${topico.id}`}
        value=""
        disabled={desabilitado}
        onChange={(event) => {
          if (event.target.value) onMover(event.target.value)
        }}
        className="min-h-11 w-full min-w-0 rounded-md border border-field-line bg-surface px-2 py-1.5 text-sm text-ink-soft outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-wait disabled:opacity-60"
      >
        <option value="">Mover para…</option>
        {destinos.map((coluna) => (
          <option key={coluna.id} value={coluna.id}>
            {coluna.titulo}
          </option>
        ))}
      </select>
    </div>
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
  alterandoResponsavel,
  onDragStart,
  onDragEnd,
  onAlterarResponsavel,
  onMover,
}) {
  const vencido =
    !colunaConcluida && dataEstaVencida(topico.dataPrevista)

  return (
    <article
      data-topico-id={topico.id}
      tabIndex={-1}
      draggable={!movendo}
      onDragStart={(event) => onDragStart(event, topico)}
      onDragEnd={onDragEnd}
      className={`min-w-0 rounded-lg border border-line-soft bg-surface p-3 shadow-sm transition-shadow focus:outline-none focus:ring-[3px] focus:ring-brand/25 ${
        arrastando
          ? 'opacity-50'
          : 'hover:shadow-md'
      } ${
        movendo
          ? 'cursor-wait'
          : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <PrioridadeBadge prioridade={topico.prioridade} />
        <GripVertical
          aria-hidden="true"
          size={14}
          className="pointer-coarse:hidden mt-0.5 shrink-0 text-ink-faint"
        />
      </div>

      <h4
        className={`mt-2 break-words text-sm font-medium leading-snug ${
          colunaConcluida
            ? 'text-ink-muted line-through'
            : 'text-ink'
        }`}
      >
        {topico.titulo}
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
        <SeletorResponsavel
          topico={topico}
          participantes={participantes}
          desabilitado={alterandoResponsavel || movendo}
          onAlterarResponsavel={(responsavelId) =>
            onAlterarResponsavel(topico.id, responsavelId)
          }
        />
      )}

      <SeletorMover
        topico={topico}
        colunaAtualId={colunaAtualId}
        colunas={colunas}
        desabilitado={movendo}
        onMover={onMover}
      />
    </article>
  )
}

export default function QuadroKanban({
  topicos = [],
  colunas = [],
  tipo,
  participantes = [],
  movendo = false,
  alterandoResponsavel = false,
  onMover,
  onAlterarResponsavel,
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

  return (
    <div
      ref={raizRef}
      className="grid grid-cols-1 gap-3 pb-2 sm:grid-cols-2 xl:grid-cols-4"
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
            className={`flex min-h-64 min-w-0 flex-col rounded-xl border transition-colors ${
              sobre
                ? 'border-brand bg-accent-soft ring-2 ring-brand/15'
                : 'border-line-soft bg-surface-hover'
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

            <ul className="flex flex-1 flex-col gap-2 p-2">
              {cards.length === 0 ? (
                <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-ink-faint">
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
                      alterandoResponsavel={alterandoResponsavel}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onAlterarResponsavel={onAlterarResponsavel}
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
