import { useState } from 'react'
import { GraduationCap, Loader2, UserRound } from 'lucide-react'
import { BOTAO_PRIMARIO, CAMPO, CARTAO, ROTULO } from '../styles/ui'
import {
  TIPO_PADRAO,
  TIPO_PESSOAL,
  TIPO_TRABALHO_ACADEMICO,
} from '../utils/quadro'

const OPCOES_TIPO = [
  {
    valor: TIPO_PESSOAL,
    titulo: 'Organização Pessoal',
    descricao: 'Rotinas e tarefas próprias.',
    Icone: UserRound,
  },
  {
    valor: TIPO_TRABALHO_ACADEMICO,
    titulo: 'Trabalho Escolar/Universitário',
    descricao: 'Integrantes e divisão de responsabilidades.',
    Icone: GraduationCap,
  },
]

export default function FormNovoGrupo({ aberto, criando, onCriar }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState(TIPO_PADRAO)

  if (!aberto) return null

  const pessoal = tipo === TIPO_PESSOAL

  async function handleSubmit(event) {
    event.preventDefault()

    if (criando) return

    const criado = await onCriar({
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      tipo,
    })

    if (criado) {
      setTitulo('')
      setDescricao('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${CARTAO} p-4`}>
      <h2 className="font-serif text-lg">Novo quadro</h2>

      <div className="mt-3 space-y-3">
        <fieldset>
          <legend className={ROTULO}>Tipo de quadro</legend>

          <div className="mt-1 grid gap-2">
            {OPCOES_TIPO.map(({ valor, titulo: tituloOpcao, descricao: texto, Icone }) => (
              <label key={valor} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value={valor}
                  checked={tipo === valor}
                  disabled={criando}
                  onChange={() => setTipo(valor)}
                  className="peer sr-only"
                />

                <span className="flex gap-2.5 rounded-lg border border-[#CBD6C8] bg-white p-3 transition-colors hover:bg-[#F7F9F4] peer-checked:border-[#2F6F4E] peer-checked:bg-[#E3EFE0] peer-checked:ring-1 peer-checked:ring-[#2F6F4E]/30 peer-focus-visible:ring-[3px] peer-focus-visible:ring-[#2F6F4E]/25">
                  <Icone
                    aria-hidden="true"
                    size={17}
                    className="mt-0.5 shrink-0 text-[#2F6F4E]"
                  />

                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug text-[#12251D]">
                      {tituloOpcao}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-[#6B7D71]">
                      {texto}
                    </span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

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
            placeholder={
              pessoal ? 'Ex.: Rotina da semana' : 'Ex.: Projeto de TCC'
            }
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
            placeholder={
              pessoal
                ? 'O que você quer organizar?'
                : 'Qual trabalho ou projeto vocês vão dividir?'
            }
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
          {criando ? 'Criando...' : 'Criar quadro'}
        </button>
      </div>
    </form>
  )
}
