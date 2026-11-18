import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { CAMPO, ROTULO } from '../styles/ui'
import {
  CATALOGO_TOPICOS,
  MAX_CARACTERES_TOPICO,
  MAX_TOPICOS,
  contemTopico,
  incluirTopico,
  removerTopico,
} from '../utils/topicos'

function chave(valor) {
  return valor.toLocaleLowerCase('pt-BR')
}

export default function SeletorTopicos({
  id,
  rotulo,
  descricao,
  selecionados,
  onChange,
  desabilitado = false,
}) {
  const [novoTopico, setNovoTopico] = useState('')
  const [erro, setErro] = useState('')

  const noLimite = selecionados.length >= MAX_TOPICOS
  const selecionadasChaves = new Set(selecionados.map(chave))
  const catalogoDisponivel = CATALOGO_TOPICOS.filter(
    (topico) => !selecionadasChaves.has(chave(topico)),
  )

  function aplicar(topicos, erroNovo) {
    setErro(erroNovo)
    if (!erroNovo) onChange(topicos)
  }

  function alternar(topico) {
    if (desabilitado) return

    if (contemTopico(selecionados, topico)) {
      aplicar(removerTopico(selecionados, topico), '')
      return
    }

    const resultado = incluirTopico(selecionados, topico)
    aplicar(resultado.topicos, resultado.erro)
  }

  function adicionar() {
    const resultado = incluirTopico(selecionados, novoTopico)
    aplicar(resultado.topicos, resultado.erro)

    if (!resultado.erro) setNovoTopico('')
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter') return

    event.preventDefault()
    adicionar()
  }

  return (
    <fieldset disabled={desabilitado} className="min-w-0">
      <legend className={`${ROTULO} flex w-full items-baseline justify-between gap-2`}>
        <span>{rotulo}</span>
        <span className="text-xs font-normal text-[#6B7D71]">
          {selecionados.length}/{MAX_TOPICOS}
        </span>
      </legend>

      {descricao && <p className="mt-0.5 text-xs text-[#6B7D71]">{descricao}</p>}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {selecionados.map((topico) => (
          <button
            key={topico}
            type="button"
            onClick={() => alternar(topico)}
            aria-pressed="true"
            aria-label={`Remover ${topico}`}
            className="inline-flex items-center gap-1 rounded-full border border-[#8FB08F] bg-[#E3EFE0] px-2.5 py-1 text-xs font-medium text-[#173D2E] transition-colors hover:bg-[#D2E4CE] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/25"
          >
            {topico}
            <X aria-hidden="true" size={12} />
          </button>
        ))}

        {catalogoDisponivel.map((topico) => (
          <button
            key={topico}
            type="button"
            onClick={() => alternar(topico)}
            aria-pressed="false"
            disabled={noLimite}
            className="rounded-full border border-[#CBD6C8] bg-white px-2.5 py-1 text-xs text-[#33473C] transition-colors hover:bg-[#F0F4EC] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {topico}
          </button>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <label htmlFor={id} className="sr-only">
          Adicionar tópico em {rotulo}
        </label>
        <input
          id={id}
          type="text"
          value={novoTopico}
          maxLength={MAX_CARACTERES_TOPICO}
          disabled={noLimite || desabilitado}
          onChange={(event) => setNovoTopico(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Adicionar outro tópico"
          className={`${CAMPO} flex-1`}
        />
        <button
          type="button"
          onClick={adicionar}
          disabled={noLimite || desabilitado || !novoTopico.trim()}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#CBD6C8] px-3 py-2 text-xs font-semibold text-[#173D2E] transition-colors hover:bg-[#EEF2EA] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus aria-hidden="true" size={14} />
          Adicionar
        </button>
      </div>

      {erro && (
        <p role="alert" className="mt-1.5 text-xs text-[#8A3B1E]">
          {erro}
        </p>
      )}
    </fieldset>
  )
}
