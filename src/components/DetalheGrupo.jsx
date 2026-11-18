import { useState } from 'react'
import { Loader2, Mail, Plus, Users } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ListaTopicos from './ListaTopicos'
import {
  BOTAO_PRIMARIO,
  CAMPO,
  CAMPO_ICONE,
  CARTAO,
  ROTULO,
} from '../styles/ui'

export default function DetalheGrupo({
  grupo,
  usuario,
  acao,
  onConvidar,
  onAdicionarTopico,
  onAlternarTopico,
}) {
  const [email, setEmail] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')

  const souDono = grupo.donoId === usuario.id
  const convidando = acao === 'convite'
  const criandoTopico = acao === 'topico'
  const alternandoTopico = acao === 'toggle'

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

    const criado = await onAdicionarTopico({
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      dataPrevista: dataPrevista || null,
    })

    if (criado) {
      setTitulo('')
      setDescricao('')
      setDataPrevista('')
    }
  }

  return (
    <div className="space-y-5">
      <section className={`${CARTAO} p-5 sm:p-6`}>
        <h2 className="font-serif text-3xl leading-tight tracking-tight text-[#12251D]">
          {grupo.titulo}
        </h2>

        {grupo.descricao && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#53655C]">
            {grupo.descricao}
          </p>
        )}

        <p className="mt-3 text-sm text-[#53655C]">
          Dono:{' '}
          <span className="font-medium text-[#12251D]">
            {souDono ? 'você' : grupo.donoNome}
          </span>
        </p>

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
                  <span className="text-sm text-[#33473C]">{membro.nome}</span>
                  <StatusBadge status={membro.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {souDono && (
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
        <h3 className="font-serif text-xl">Rotina de estudos</h3>

        <form onSubmit={handleAdicionarTopico} className="mt-3 space-y-3">
          <div>
            <label htmlFor="topico-titulo" className={ROTULO}>
              Título do tópico
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

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="topico-data" className={ROTULO}>
                Data prevista (opcional)
              </label>
              <input
                id="topico-data"
                name="dataPrevista"
                type="date"
                disabled={criandoTopico}
                value={dataPrevista}
                onChange={(event) => setDataPrevista(event.target.value)}
                className={CAMPO}
              />
            </div>

            <button
              type="submit"
              disabled={criandoTopico || !titulo.trim()}
              className={`${BOTAO_PRIMARIO} px-4 py-2.5 text-sm`}
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
              {criandoTopico ? 'Adicionando...' : 'Adicionar tópico'}
            </button>
          </div>
        </form>

        <div className="mt-4">
          <ListaTopicos
            topicos={grupo.topicos}
            alternando={alternandoTopico}
            onAlternar={onAlternarTopico}
          />
        </div>
      </section>
    </div>
  )
}
