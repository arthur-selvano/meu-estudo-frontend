import { useState } from 'react'
import {
  CalendarDays,
  GraduationCap,
  Loader2,
  Mail,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react'
import Avatar from './Avatar'
import DetalheTopicoModal from './DetalheTopicoModal'
import StatusBadge from './StatusBadge'
import QuadroKanban from './QuadroKanban'
import Modal from './Modal'
import { obterDetalhe } from '../services/topicoDetalheService'
import {
  BOTAO_ICONE_PERIGO,
  BOTAO_PRIMARIO,
  BOTAO_SECUNDARIO,
  CAMPO,
  CAMPO_ICONE,
  CARTAO,
  ROTULO,
} from '../styles/ui'
import { PRIORIDADES, PRIORIDADE_PADRAO } from '../utils/prioridades'
import {
  TIPO_TRABALHO_ACADEMICO,
  calcularOrdemMover,
  ehQuadroPessoal,
  idColunaDoTopico,
  obterColunaSelecionada,
  obterColunas,
  obterColunasReais,
  participantesDoGrupo,
  tipoDoQuadro,
} from '../utils/quadro'

export default function DetalheGrupo({
  grupo,
  usuario,
  acao,
  onConvidar,
  onAdicionarTopico,
  onMoverTopico,
  onAlterarResponsavel,
  onVerPerfil,
  onRemoverMembro,
  onExcluirQuadro,
}) {
  const [email, setEmail] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  const [prioridade, setPrioridade] = useState(PRIORIDADE_PADRAO)
  const [responsavelId, setResponsavelId] = useState('')
  const [colunaId, setColunaId] = useState('')
  const [erroFormulario, setErroFormulario] = useState('')
  const [novoCardAberto, setNovoCardAberto] = useState(false)
  const [membrosAberto, setMembrosAberto] = useState(false)
  const [visao, setVisao] = useState('quadro')
  const [topicoDetalhe, setTopicoDetalhe] = useState(null)
  const [detalhesPorTopico, setDetalhesPorTopico] = useState({})

  const pessoal = ehQuadroPessoal(grupo)
  const tipo = tipoDoQuadro(grupo)
  const colunas = obterColunas(grupo)
  const colunasReais = obterColunasReais(grupo)
  const colunaSelecionada = obterColunaSelecionada(grupo, colunaId)
  const participantes = participantesDoGrupo(grupo, usuario)

  const souDono = grupo.donoId === usuario.id
  const convidando = acao === 'convite'
  const criandoTopico = acao === 'topico'
  const movendo = acao === 'mover'
  const alterandoResponsavel = acao === 'responsavel'

  const topicoAberto = topicoDetalhe
    ? grupo.topicos.find((item) => item.id === topicoDetalhe.id) ??
      topicoDetalhe
    : null
  const colunaAtualAberta = topicoAberto
    ? idColunaDoTopico(topicoAberto, colunas)
    : null

  function handleMoverColuna(colunaId) {
    if (!topicoAberto) return Promise.resolve(false)

    return onMoverTopico(
      topicoAberto.id,
      colunaId,
      calcularOrdemMover(grupo.topicos, topicoAberto.id, colunaId, colunas),
    )
  }

  async function handleConvidar(event) {
    event.preventDefault()

    if (convidando) return

    const destinatario = email.trim()

    if (!destinatario) return

    const enviado = await onConvidar(destinatario)

    if (enviado) setEmail('')
  }

  function abrirNovoCard() {
    setErroFormulario('')
    setNovoCardAberto(true)
  }

  function abrirDetalhe(topico) {
    setTopicoDetalhe(topico)
    setDetalhesPorTopico((atuais) => ({
      ...atuais,
      [topico.id]: obterDetalhe(topico.id),
    }))
  }

  function handleDetalheAtualizado(topicoId, detalhe) {
    setDetalhesPorTopico((atuais) => ({
      ...atuais,
      [topicoId]: { ...detalhe },
    }))
  }

  async function handleAdicionarTopico(event) {
    event.preventDefault()

    if (criandoTopico) return

    setErroFormulario('')

    if (!colunaSelecionada) {
      setErroFormulario(
        'Este quadro não possui colunas Kanban. Recarregue a página e tente novamente.',
      )
      return
    }

    const payload = {
      titulo: titulo.trim(),
      colunaId: colunaSelecionada.id,
      descricao: descricao.trim() || null,
      dataPrevista: dataPrevista || null,
      prioridade,
      responsavelId:
        tipo === TIPO_TRABALHO_ACADEMICO ? responsavelId || null : null,
    }

    const criado = await onAdicionarTopico(payload)

    if (criado) {
      setTitulo('')
      setDescricao('')
      setDataPrevista('')
      setPrioridade(PRIORIDADE_PADRAO)
      setResponsavelId('')
      setColunaId('')
      setNovoCardAberto(false)
    }
  }

  return (
    <div className="space-y-4">
      <section className={`${CARTAO} p-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line bg-surface-soft px-2 py-0.5 text-[11px] font-medium text-ink-muted">
              {pessoal ? (
                <UserRound aria-hidden="true" size={12} />
              ) : (
                <GraduationCap aria-hidden="true" size={12} />
              )}
              {pessoal ? 'Organização pessoal' : 'Trabalho acadêmico'}
            </span>

            <h2
              className="min-w-0 truncate text-lg font-semibold tracking-tight text-ink"
              title={grupo.titulo}
            >
              {grupo.titulo}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {grupo.membros.length > 0 && (
              <div className="flex -space-x-1.5">
                {grupo.membros.slice(0, 5).map((membro) => (
                  <button
                    key={membro.usuarioId}
                    type="button"
                    onClick={() => onVerPerfil(membro.usuarioId)}
                    aria-label={`Ver perfil de ${membro.nome}`}
                    title={
                      membro.status === 'Pendente'
                        ? `${membro.nome} (pendente)`
                        : membro.nome
                    }
                    className="rounded-full ring-2 ring-surface transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    <Avatar
                      nome={membro.nome}
                      fotoUrl={membro.fotoUrl}
                      tamanho="sm"
                    />
                  </button>
                ))}

                {grupo.membros.length > 5 && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-[10px] font-medium text-ink-muted ring-2 ring-surface">
                    +{grupo.membros.length - 5}
                  </span>
                )}
              </div>
            )}

            {souDono && (!pessoal || grupo.membros.length > 0) && (
              <button
                type="button"
                onClick={() => setMembrosAberto(true)}
                aria-label="Convidar ou gerenciar membros"
                title="Membros"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-field-line text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
              >
                <UserPlus aria-hidden="true" size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={abrirNovoCard}
              className={`${BOTAO_PRIMARIO} h-8 px-2.5 text-xs`}
            >
              <Plus aria-hidden="true" size={14} />
              Novo card
            </button>

            {souDono && (
              <button
                type="button"
                onClick={onExcluirQuadro}
                aria-label="Excluir quadro"
                title="Excluir quadro"
                className={`${BOTAO_ICONE_PERIGO} h-8 w-8`}
              >
                <Trash2 aria-hidden="true" size={15} />
              </button>
            )}
          </div>
        </div>

        {grupo.descricao && (
          <p className="mt-2 line-clamp-2 max-w-2xl break-words text-sm text-ink-secondary">
            {grupo.descricao}
          </p>
        )}

        {!souDono && (
          <p className="mt-1 break-words text-xs text-ink-muted">
            Dono:{' '}
            <button
              type="button"
              onClick={() => onVerPerfil(grupo.donoId)}
              aria-label={`Ver perfil de ${grupo.donoNome}`}
              className="rounded-sm font-medium text-ink-soft underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              {grupo.donoNome}
            </button>
          </p>
        )}
      </section>

      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-muted">Visão</span>
        <div className="inline-flex items-center rounded-md border border-line bg-surface p-0.5">
          {[
            ['quadro', 'Quadro'],
            ['lista', 'Lista'],
            ['cronograma', 'Cronograma'],
          ].map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setVisao(valor)}
              aria-pressed={visao === valor}
              className={`h-7 rounded-sm px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 ${
                visao === valor
                  ? 'bg-surface-hover text-ink'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      <section className="min-w-0">
        <QuadroKanban
          topicos={grupo.topicos}
          colunas={colunas}
          tipo={tipo}
          participantes={participantes}
          movendo={movendo}
          alterandoResponsavel={alterandoResponsavel}
          visao={visao}
          detalhes={detalhesPorTopico}
          onAbrirDetalhe={abrirDetalhe}
          onMover={onMoverTopico}
        />
      </section>

      {novoCardAberto && (
        <Modal
          labelledBy="titulo-novo-card"
          onFechar={() => setNovoCardAberto(false)}
          bloqueado={criandoTopico}
          className="max-w-lg"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
            <h2
              id="titulo-novo-card"
              className="text-sm font-semibold text-ink"
            >
              Novo card
            </h2>
            <button
              type="button"
              onClick={() => setNovoCardAberto(false)}
              disabled={criandoTopico}
              aria-label="Fechar novo card"
              className="flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-50"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>

          <form
            onSubmit={handleAdicionarTopico}
            className="space-y-3 px-4 py-4 sm:px-5"
          >
            <div>
              <label htmlFor="topico-titulo" className={ROTULO}>
                Título do card
              </label>
              <input
                id="topico-titulo"
                name="titulo"
                type="text"
                required
                maxLength={200}
                disabled={criandoTopico}
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                placeholder="Ex.: Revisar LINQ"
                className={CAMPO}
              />
            </div>

            <div>
              <label htmlFor="topico-descricao" className={ROTULO}>
                Descrição (opcional)
              </label>
              <textarea
                id="topico-descricao"
                name="descricao"
                rows={2}
                disabled={criandoTopico}
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="O que precisa ser feito?"
                className={`${CAMPO} resize-y`}
              />
            </div>

            <div>
              <label htmlFor="topico-coluna" className={ROTULO}>
                Coluna
              </label>
              <select
                id="topico-coluna"
                name="colunaId"
                required
                disabled={criandoTopico || colunasReais.length === 0}
                value={colunaSelecionada?.id ?? ''}
                onChange={(event) => setColunaId(event.target.value)}
                className={CAMPO}
              >
                {colunasReais.map((coluna) => (
                  <option key={coluna.id} value={coluna.id}>
                    {coluna.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="topico-data" className={ROTULO}>
                  Prazo (opcional)
                </label>
                <div className="relative w-full">
                  <CalendarDays
                    aria-hidden="true"
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-ink-faint"
                  />
                  <input
                    id="topico-data"
                    name="dataPrevista"
                    type="date"
                    disabled={criandoTopico}
                    value={dataPrevista}
                    onChange={(event) => setDataPrevista(event.target.value)}
                    className={`${CAMPO_ICONE} block min-w-0 max-w-full text-left`}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label htmlFor="topico-prioridade" className={ROTULO}>
                  Prioridade
                </label>
                <select
                  id="topico-prioridade"
                  name="prioridade"
                  disabled={criandoTopico}
                  value={prioridade}
                  onChange={(event) => setPrioridade(event.target.value)}
                  className={CAMPO}
                >
                  {PRIORIDADES.map((opcao) => (
                    <option key={opcao.valor} value={opcao.valor}>
                      {opcao.rotulo}
                    </option>
                  ))}
                </select>
              </div>

              {tipo === TIPO_TRABALHO_ACADEMICO && (
                <div className="min-w-0 sm:col-span-2">
                  <label htmlFor="topico-responsavel" className={ROTULO}>
                    Responsável (opcional)
                  </label>
                  <select
                    id="topico-responsavel"
                    name="responsavelId"
                    disabled={criandoTopico}
                    value={responsavelId}
                    onChange={(event) => setResponsavelId(event.target.value)}
                    className={CAMPO}
                  >
                    <option value="">Sem responsável</option>
                    {participantes.map((pessoa) => (
                      <option key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {erroFormulario && (
              <p role="alert" className="text-xs font-medium text-danger-ink">
                {erroFormulario}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNovoCardAberto(false)}
                disabled={criandoTopico}
                className={`${BOTAO_SECUNDARIO} min-h-10 px-3 py-2 text-sm`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={criandoTopico || !titulo.trim()}
                className={`${BOTAO_PRIMARIO} min-h-10 px-3 py-2 text-sm`}
              >
                {criandoTopico ? (
                  <Loader2
                    aria-hidden="true"
                    size={16}
                    className="motion-safe:animate-spin"
                  />
                ) : (
                  <Plus aria-hidden="true" size={16} />
                )}
                {criandoTopico ? 'Adicionando...' : 'Adicionar card'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {membrosAberto && (
        <Modal
          labelledBy="titulo-membros"
          onFechar={() => setMembrosAberto(false)}
          bloqueado={convidando}
          className="max-w-lg"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
            <h2 id="titulo-membros" className="text-sm font-semibold text-ink">
              Membros
            </h2>
            <button
              type="button"
              onClick={() => setMembrosAberto(false)}
              disabled={convidando}
              aria-label="Fechar membros"
              className="flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-50"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>

          <div className="space-y-4 px-4 py-4 sm:px-5">
            {souDono && !pessoal && (
              <form
                onSubmit={handleConvidar}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <div className="relative min-w-0 flex-1">
                  <Mail
                    aria-hidden="true"
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
                  />
                  <label htmlFor="convite-email" className="sr-only">
                    E-mail do convidado
                  </label>
                  <input
                    id="convite-email"
                    name="email"
                    type="email"
                    required
                    disabled={convidando}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="email@exemplo.com"
                    className={CAMPO_ICONE}
                  />
                </div>

                <button
                  type="submit"
                  disabled={convidando || !email.trim()}
                  className={`${BOTAO_PRIMARIO} min-h-10 px-3 py-2 text-sm`}
                >
                  {convidando && (
                    <Loader2
                      aria-hidden="true"
                      size={16}
                      className="motion-safe:animate-spin"
                    />
                  )}
                  {convidando ? 'Convidando...' : 'Convidar'}
                </button>
              </form>
            )}

            {grupo.membros.length === 0 ? (
              <p className="text-sm text-ink-muted">
                Nenhum membro convidado ainda.
              </p>
            ) : (
              <ul className="space-y-1">
                {grupo.membros.map((membro) => (
                  <li
                    key={membro.usuarioId}
                    className="flex items-center gap-2 rounded-md border border-line px-2.5 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => onVerPerfil(membro.usuarioId)}
                      aria-label={`Ver perfil de ${membro.nome}`}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      <Avatar
                        nome={membro.nome}
                        fotoUrl={membro.fotoUrl}
                        tamanho="xs"
                      />
                      <span className="truncate text-sm text-ink-soft hover:underline">
                        {membro.nome}
                      </span>
                    </button>

                    <StatusBadge status={membro.status} />

                    {souDono && (
                      <button
                        type="button"
                        onClick={() => onRemoverMembro(membro)}
                        aria-label={
                          membro.status === 'Pendente'
                            ? `Cancelar convite de ${membro.nome}`
                            : `Remover ${membro.nome} do quadro`
                        }
                        title={
                          membro.status === 'Pendente'
                            ? 'Cancelar convite'
                            : 'Remover do quadro'
                        }
                        className={`${BOTAO_ICONE_PERIGO} h-7 w-7 shrink-0`}
                      >
                        <UserMinus aria-hidden="true" size={13} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {topicoAberto && (
        <DetalheTopicoModal
          topico={topicoAberto}
          tipo={tipo}
          colunas={colunas}
          colunaAtualId={colunaAtualAberta}
          onMoverColuna={handleMoverColuna}
          participantes={participantes}
          alterandoResponsavel={alterandoResponsavel}
          onAlterarResponsavel={(responsavelId) =>
            onAlterarResponsavel(topicoAberto.id, responsavelId)
          }
          usuario={usuario}
          onFechar={() => setTopicoDetalhe(null)}
          onDetalheAtualizado={handleDetalheAtualizado}
        />
      )}
    </div>
  )
}
