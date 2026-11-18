import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { BOTAO_PRIMARIO, CAMPO, CARTAO, ROTULO } from '../styles/ui'

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
    <form onSubmit={handleSubmit} className={`${CARTAO} p-4`}>
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
          className={`${BOTAO_PRIMARIO} w-full px-3 py-2.5 text-sm`}
        >
          {criando && (
            <Loader2
              aria-hidden="true"
              size={16}
              className="motion-safe:animate-spin"
            />
          )}
          {criando ? 'Criando...' : 'Criar grupo'}
        </button>
      </div>
    </form>
  )
}
