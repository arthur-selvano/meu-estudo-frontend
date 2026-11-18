import { useState } from 'react'
import { Loader2 } from 'lucide-react'

const CAMPO =
  'w-full rounded-lg border border-[#CBD6C8] bg-white px-3 py-2.5 text-sm text-[#12251D] placeholder:text-[#9AA79D] outline-none transition-colors focus:border-[#2F6F4E] focus:ring-[3px] focus:ring-[#2F6F4E]/15 disabled:cursor-not-allowed disabled:bg-[#F0F2EC]'
const ROTULO = 'mb-1 block text-xs font-medium text-[#33473C]'

export default function FormNovoGrupo({ aberto, criando, onCriar }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')

  if (!aberto) return null

  async function handleSubmit(event) {
    event.preventDefault()

    if (criando) return

    await onCriar({
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#CBD6C8] bg-white p-4 shadow-sm"
    >
      <h2 className="font-serif text-lg">Novo grupo</h2>

      <div className="mt-3 space-y-3">
        <div>
          <label htmlFor="novo-grupo-titulo" className={ROTULO}>
            Título
          </label>
          <input
            id="novo-grupo-titulo"
            name="titulo"
            type="text"
            required
            maxLength={150}
            disabled={criando}
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            placeholder="Ex.: Estudos de C#"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor="novo-grupo-descricao" className={ROTULO}>
            Descrição (opcional)
          </label>
          <textarea
            id="novo-grupo-descricao"
            name="descricao"
            rows={3}
            disabled={criando}
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="O que vocês vão estudar?"
            className={`${CAMPO} resize-y`}
          />
        </div>

        <button
          type="submit"
          disabled={criando}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173D2E] px-3 py-2.5 text-sm font-semibold text-[#F4F6F0] transition-colors hover:bg-[#1F4D3A] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {criando && (
            <Loader2 aria-hidden="true" size={16} className="motion-safe:animate-spin" />
          )}
          {criando ? 'Criando...' : 'Criar grupo'}
        </button>
      </div>
    </form>
  )
}
