import { useEffect, useState } from 'react'
import { Loader2, Search, Users } from 'lucide-react'
import Avatar from './Avatar'
import { BOTAO_SECUNDARIO, CAMPO_ICONE, CARTAO } from '../styles/ui'
import { mensagemDeErro } from '../services/api'
import { listarPerfisPublicos } from '../services/perfilService'

function correspondeAoTermo(perfil, termo) {
  if (!termo) return true

  const valores = [
    perfil.nome,
    perfil.cursoOuArea,
    perfil.instituicao,
    ...(perfil.topicosInteresse ?? []),
    ...(perfil.topicosAjuda ?? []),
  ].filter(Boolean)

  return valores.some((valor) =>
    valor.toLocaleLowerCase('pt-BR').includes(termo),
  )
}

export default function ListaMembros({ usuarioId, onVerPerfil }) {
  const [membros, setMembros] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true

    listarPerfisPublicos()
      .then((dados) => {
        if (!ativo) return
        setMembros(dados)
        setCarregando(false)
      })
      .catch((err) => {
        if (!ativo) return
        setErro(mensagemDeErro(err, 'Não foi possível carregar os membros.'))
        setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [tentativa])

  function tentarNovamente() {
    setCarregando(true)
    setErro('')
    setTentativa((valor) => valor + 1)
  }

  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const filtrados = membros.filter((perfil) => correspondeAoTermo(perfil, termo))

  return (
    <section className={`${CARTAO} min-w-0 p-4`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Users aria-hidden="true" size={15} className="text-ink-faint" />
          Membro
        </h2>
        {membros.length > 0 && (
          <span className="rounded-full bg-surface-soft px-2 py-0.5 text-xs font-semibold text-ink-muted">
            {membros.length}
          </span>
        )}
      </div>

      <div className="relative mt-3">
        <Search
          aria-hidden="true"
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <label htmlFor="busca-membros" className="sr-only">
          Buscar membros
        </label>
        <input
          id="busca-membros"
          type="search"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar membro..."
          className={`${CAMPO_ICONE} py-2 text-sm`}
        />
      </div>

      {carregando ? (
        <div className="flex min-h-24 items-center justify-center">
          <Loader2
            aria-hidden="true"
            size={20}
            className="motion-safe:animate-spin text-brand"
          />
          <span className="sr-only">Carregando membros</span>
        </div>
      ) : erro ? (
        <div className="mt-3 space-y-2">
          <p role="alert" className="text-sm text-danger-ink">
            {erro}
          </p>
          <button
            type="button"
            onClick={tentarNovamente}
            className={`${BOTAO_SECUNDARIO} px-3 py-2 text-xs`}
          >
            Tentar novamente
          </button>
        </div>
      ) : filtrados.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">
          {membros.length === 0
            ? 'Nenhum membro cadastrado ainda.'
            : 'Nenhum membro encontrado.'}
        </p>
      ) : (
        <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto pr-1">
          {filtrados.map((perfil) => {
            const souEu = perfil.id === usuarioId
            const formacao = [perfil.cursoOuArea, perfil.instituicao]
              .filter(Boolean)
              .join(' · ')
            const ajuda = (perfil.topicosAjuda ?? []).slice(0, 2).join(', ')

            return (
              <li key={perfil.id}>
                <button
                  type="button"
                  onClick={() => onVerPerfil(perfil.id)}
                  aria-label={`Ver perfil de ${perfil.nome}`}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/20"
                >
                  <Avatar
                    nome={perfil.nome}
                    fotoUrl={perfil.fotoUrl}
                    tamanho="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-ink">
                        {perfil.nome}
                      </span>
                      {souEu && (
                        <span className="shrink-0 rounded-full border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
                          você
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-muted">
                      {formacao || (ajuda ? `Pode ajudar em ${ajuda}` : 'Membro da comunidade')}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
