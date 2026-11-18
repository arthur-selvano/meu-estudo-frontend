import { useState } from 'react'
import {
  CalendarDays,
  GraduationCap,
  Loader2,
  Mail,
  Plus,
  UserRound,
  Users,
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import QuadroKanban from './QuadroKanban'
import {
  BOTAO_PRIMARIO,
  CAMPO,
  CAMPO_ICONE,
  CARTAO,
  ROTULO,
} from '../styles/ui'
import { PRIORIDADES, PRIORIDADE_PADRAO } from '../utils/prioridades'
import {
  TIPO_TRABALHO_ACADEMICO,
  ehQuadroPessoal,
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
}) {
  const [email, setEmail] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  const [prioridade, setPrioridade] = useState(PRIORIDADE_PADRAO)
  const [responsavelId, setResponsavelId] = useState('')
  const [colunaId, setColunaId] = useState('')
  const [erroFormulario, setErroFormulario] = useState('')

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

  async function handleConvidar(event) {
    event.preventDefault()

    if (convidando) return

    const destinatario = email.trim()

    if (!destinatario) return

    const enviado = await onConvidar(destinatario)

    if (enviado) setEmail('')
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
    }
  }

  return (
    <div className="space-y-5">
      <section className={`${CARTAO} p-5 sm:p-6`}>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            pessoal
              ? 'border-[#B7D2B4] bg-[#E3EFE0] text-[#245B34]'
              : 'border-[#CBD6C8] bg-[#F0F4EC] text-[#3F5A45]'
          }`}
        >
          {pessoal ? (
            <UserRound aria-hidden="true" size={13} />
          ) : (
            <GraduationCap aria-hidden="true" size={13} />
          )}
          {pessoal ? 'Organização pessoal' : 'Trabalho acadêmico'}
        </span>

        <h2 className="mt-2 font-serif text-3xl leading-tight tracking-tight text-[#12251D]">
          {grupo.titulo}
        </h2>

        {grupo.descricao && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#53655C]">
            {grupo.descricao}
          </p>
        )}

        <p className="mt-3 text-sm text-[#53655C]">
          Dono:{' '}
          {souDono ? (
            <span className="font-medium text-[#12251D]">você</span>
          ) : (
            <button
              type="button"
              onClick={() => onVerPerfil(grupo.donoId)}
              aria-label={`Ver perfil de ${grupo.donoNome}`}
              className="rounded-sm font-medium text-[#12251D] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F4E]/40"
            >
              {grupo.donoNome}
            </button>
          )}
        </p>

        {(!pessoal || grupo.membros.length > 0) && (
          <div className="mt-5 border-t border-[#E1E8DE] pt-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#33473C]">
              <Users aria-hidden="true" size={15} />
              Membros
            </h3>

            {grupo.membros.length === 0 ? (
              <p className="mt-2 text-sm text-[#6B7D71]">
                Nenhum membro convidado ainda.
              </p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {grupo.membros.map((membro) => (
                  <li
                    key={membro.usuarioId}
                    className="flex items-center gap-2 rounded-lg border border-[#E1E8DE] bg-[#FAFBF8] px-3 py-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => onVerPerfil(membro.usuarioId)}
                      aria-label={`Ver perfil de ${membro.nome}`}
                      className="rounded-sm text-sm text-[#33473C] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F4E]/40"
                    >
                      {membro.nome}
                    </button>
                    <StatusBadge status={membro.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {souDono && !pessoal && (
        <section className={`${CARTAO} p-5`}>
          <h3 className="font-serif text-xl">Convidar membro</h3>
          <p className="mt-1 text-xs text-[#6B7D71]">
            A pessoa precisa já ter uma conta no MeuEstudos.
          </p>

          <form
            onSubmit={handleConvidar}
            className="mt-3 flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Mail
                aria-hidden="true"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A8F]"
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
              className={`${BOTAO_PRIMARIO} px-4 py-2.5 text-sm`}
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
        </section>
      )}

      <section className={`${CARTAO} p-5`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-serif text-xl">Quadro de tarefas</h3>
          <p className="text-xs text-[#6B7D71]">
            Arraste os cards entre as colunas.
          </p>
        </div>

        <form
          onSubmit={handleAdicionarTopico}
          className="mt-4 space-y-3 rounded-lg border border-[#E1E8DE] bg-[#FAFBF8] p-3"
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
            <p className="mt-1 text-xs text-[#6B7D71]">
              O card será criado na coluna selecionada.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="topico-data" className={ROTULO}>
                Prazo (opcional)
              </label>
              <div className="relative">
                <CalendarDays
                  aria-hidden="true"
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A8F]"
                />
                <input
                  id="topico-data"
                  name="dataPrevista"
                  type="date"
                  disabled={criandoTopico}
                  value={dataPrevista}
                  onChange={(event) => setDataPrevista(event.target.value)}
                  className={`${CAMPO} pl-9`}
                />
              </div>
            </div>

            <div>
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
              <div className="sm:col-span-2">
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
                <p className="mt-1 text-xs text-[#6B7D71]">
                  Defina quem fica responsável por este card.
                </p>
              </div>
            )}
          </div>

          {erroFormulario && (
            <p role="alert" className="text-xs font-medium text-[#8A3B1E]">
              {erroFormulario}
            </p>
          )}

          <button
            type="submit"
            disabled={criandoTopico || !titulo.trim()}
            className={`${BOTAO_PRIMARIO} w-full px-4 py-2.5 text-sm sm:w-auto`}
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
        </form>

        <div className="mt-5">
          <QuadroKanban
            topicos={grupo.topicos}
            colunas={colunas}
            tipo={tipo}
            participantes={participantes}
            movendo={movendo}
            alterandoResponsavel={alterandoResponsavel}
            onMover={onMoverTopico}
            onAlterarResponsavel={onAlterarResponsavel}
          />
        </div>
      </section>
    </div>
  )
}
