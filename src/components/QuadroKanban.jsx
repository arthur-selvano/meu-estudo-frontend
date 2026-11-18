import { useState } from 'react'
import { CalendarDays, GripVertical, UserRound } from 'lucide-react'
import Avatar from './Avatar'
import PrioridadeBadge from './PrioridadeBadge'
import { dataEstaVencida, formatarDataSimples } from '../utils/datas'
import {
  TIPO_TRABALHO_ACADEMICO,
  ehColunaConcluida,
  idColunaDoTopico,
  topicosDaColuna,
} from '../utils/quadro'

const CORES_COLUNA = [
  'bg-[#8A9A8F]',
  'bg-[#C08A2E]',
  'bg-[#4E6FA8]',
  'bg-[#2F6F4E]',
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
      className="mt-2.5 border-t border-[#EDF1EA] pt-2.5"
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
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-[#CBD6C8] bg-white text-[#8A9A8F]"
          >
            <UserRound size={12} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-[#33473C]">
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
            className="mt-0.5 w-full rounded-md border border-[#DCE3D8] bg-white px-1.5 py-1 text-[11px] text-[#33473C] outline-none transition-colors focus:border-[#2F6F4E] focus:ring-2 focus:ring-[#2F6F4E]/15 disabled:cursor-wait disabled:opacity-60"
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

function CartaoTopico({
  topico,
  tipo,
  participantes,
  colunaConcluida,
  arrastando,
  movendo,
  alterandoResponsavel,
  onDragStart,
  onDragEnd,
  onAlterarResponsavel,
}) {
  const vencido =
    !colunaConcluida && dataEstaVencida(topico.dataPrevista)

  return (
    <article
      draggable={!movendo}
      onDragStart={(event) => onDragStart(event, topico)}
      onDragEnd={onDragEnd}
      className={`rounded-lg border border-[#DCE3D8] bg-white p-3 shadow-sm transition-shadow ${
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
          className="mt-0.5 shrink-0 text-[#B7C3B4]"
        />
      </div>

      <h4
        className={`mt-2 text-sm font-medium leading-snug ${
          colunaConcluida
            ? 'text-[#6B7D71] line-through'
            : 'text-[#12251D]'
        }`}
      >
        {topico.titulo}
      </h4>

      {topico.descricao && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6B7D71]">
          {topico.descricao}
        </p>
      )}

      {topico.dataPrevista && (
        <p
          className={`mt-2 flex items-center gap-1 text-xs ${
            vencido
              ? 'font-medium text-[#8A3B1E]'
              : 'text-[#6B7D71]'
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

    const cardsNaColuna = topicosDaColuna(topicos, coluna.id, colunas).filter(
      (item) => item.id !== topicoId,
    )

    onMover(topicoId, coluna.id, cardsNaColuna.length)
  }

  return (
    <div className="grid grid-flow-col auto-cols-[minmax(13.5rem,1fr)] gap-3 overflow-x-auto pb-2">
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
            className={`flex min-h-64 flex-col rounded-xl border transition-colors ${
              sobre
                ? 'border-[#2F6F4E] bg-[#E3EFE0] ring-2 ring-[#2F6F4E]/15'
                : 'border-[#DCE3D8] bg-[#EEF2EA]'
            }`}
          >
            <header className="flex items-center justify-between gap-2 border-b border-[#DCE3D8] px-3 py-2.5">
              <h3
                id={tituloId}
                className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[#33473C]"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    CORES_COLUNA[indice % CORES_COLUNA.length]
                  }`}
                />
                <span className="truncate">{coluna.titulo}</span>
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-[#6B7D71]">
                {cards.length}
              </span>
            </header>

            <ul className="flex flex-1 flex-col gap-2 p-2">
              {cards.length === 0 ? (
                <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[#CBD6C8] px-3 py-6 text-center text-xs text-[#8A9A8F]">
                  {sobre ? 'Solte o card aqui' : 'Nenhum card'}
                </li>
              ) : (
                cards.map((topico) => (
                  <li key={topico.id}>
                    <CartaoTopico
                      topico={topico}
                      tipo={tipo}
                      participantes={participantes}
                      colunaConcluida={concluida}
                      arrastando={arrastandoId === topico.id}
                      movendo={movendo}
                      alterandoResponsavel={alterandoResponsavel}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onAlterarResponsavel={onAlterarResponsavel}
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
