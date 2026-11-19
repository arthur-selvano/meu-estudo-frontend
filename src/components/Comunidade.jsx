import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import CardPublicacao from './CardPublicacao'
import ComposerPublicacao from './ComposerPublicacao'
import FeedbackBanner from './FeedbackBanner'
import ListaMembros from './ListaMembros'
import ModalConfirmacao from './ModalConfirmacao'
import { useToast } from '../context/ToastContext'
import { mensagemDeErro } from '../services/api'
import {
  alternarCurtida,
  comentarPublicacao,
  criarPublicacao,
  excluirPublicacao,
  listarPublicacoes,
} from '../services/publicacaoService'
import { BOTAO_SECUNDARIO, CARTAO } from '../styles/ui'
import { TIPOS_PUBLICACAO } from '../utils/publicacoes'

const FILTROS = [
  { valor: 'TODOS', rotulo: 'Todos' },
  ...TIPOS_PUBLICACAO.map((tipo) => ({
    valor: tipo.valor,
    rotulo: tipo.rotulo,
  })),
]

export default function Comunidade({ usuario, onVerPerfil }) {
  const { mostrarSucesso, mostrarErro } = useToast()
  const [publicacoes, setPublicacoes] = useState([])
  const [filtro, setFiltro] = useState('TODOS')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [acao, setAcao] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [publicacaoParaExcluir, setPublicacaoParaExcluir] = useState(null)

  useEffect(() => {
    let ativo = true

    listarPublicacoes()
      .then((dados) => {
        if (!ativo) return
        setPublicacoes(dados)
        setCarregando(false)
      })
      .catch((err) => {
        if (!ativo) return
        setErro(mensagemDeErro(err, 'Não foi possível carregar o feed.'))
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

  async function executarAcao(nome, tarefa) {
    setAcao(nome)

    try {
      return await tarefa()
    } catch (err) {
      mostrarErro(mensagemDeErro(err))
      return false
    } finally {
      setAcao('')
    }
  }

  function substituirPublicacao(atualizada) {
    setPublicacoes((atuais) =>
      atuais.map((publicacao) =>
        publicacao.id === atualizada.id ? atualizada : publicacao,
      ),
    )
  }

  function handlePublicar(dados) {
    return executarAcao('publicar', async () => {
      const nova = await criarPublicacao(dados)

      setPublicacoes((atuais) => [nova, ...atuais])
      setFiltro('TODOS')
      mostrarSucesso('Publicação criada.')
      return true
    })
  }

  function handleCurtir(publicacaoId) {
    return executarAcao(`curtir:${publicacaoId}`, async () => {
      const atualizada = await alternarCurtida(publicacaoId)

      substituirPublicacao(atualizada)
      return true
    })
  }

  function handleComentar(publicacaoId, conteudo) {
    return executarAcao(`comentar:${publicacaoId}`, async () => {
      const atualizada = await comentarPublicacao(publicacaoId, conteudo)

      substituirPublicacao(atualizada)
      mostrarSucesso('Comentário publicado.')
      return true
    })
  }

  function handleConfirmarExclusao() {
    if (!publicacaoParaExcluir) return Promise.resolve(false)

    const alvo = publicacaoParaExcluir

    return executarAcao('excluir-publicacao', async () => {
      await excluirPublicacao(alvo.id)

      setPublicacoes((atuais) =>
        atuais.filter((publicacao) => publicacao.id !== alvo.id),
      )
      setPublicacaoParaExcluir(null)
      mostrarSucesso('Publicação excluída.')
      return true
    })
  }

  const visiveis =
    filtro === 'TODOS'
      ? publicacoes
      : publicacoes.filter((publicacao) => publicacao.tipo === filtro)

  const detalheExclusao = publicacaoParaExcluir
    ? publicacaoParaExcluir.titulo || publicacaoParaExcluir.conteudo
    : ''

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0 space-y-4">
        <ComposerPublicacao
          usuario={usuario}
          publicando={acao === 'publicar'}
          onPublicar={handlePublicar}
        />

        <section className={`${CARTAO} min-w-0 p-4 sm:p-5`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-xl">Feed da comunidade</h2>
            <p className="text-xs text-ink-muted">
              {visiveis.length}{' '}
              {visiveis.length === 1 ? 'publicação' : 'publicações'}
            </p>
          </div>

          <div
            role="group"
            aria-label="Filtrar publicações"
            className="mt-3 flex flex-wrap gap-1.5"
          >
            {FILTROS.map((opcao) => {
              const ativo = filtro === opcao.valor

              return (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setFiltro(opcao.valor)}
                  aria-pressed={ativo}
                  className={`min-h-8 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 ${
                    ativo
                      ? 'border-accent-line bg-accent-soft text-accent-ink'
                      : 'border-field-line bg-surface text-ink-soft hover:bg-surface-hover'
                  }`}
                >
                  {opcao.rotulo}
                </button>
              )
            })}
          </div>

          <div className="mt-4">
            {carregando ? (
              <div className="flex min-h-40 items-center justify-center">
                <Loader2
                  aria-hidden="true"
                  size={24}
                  className="motion-safe:animate-spin text-brand"
                />
                <span className="sr-only">Carregando feed</span>
              </div>
            ) : erro ? (
              <div className="space-y-3">
                <FeedbackBanner tipo="erro" mensagem={erro} />
                <button
                  type="button"
                  onClick={tentarNovamente}
                  className={`${BOTAO_SECUNDARIO} px-3.5 py-2 text-sm`}
                >
                  <RefreshCw aria-hidden="true" size={15} />
                  Tentar novamente
                </button>
              </div>
            ) : visiveis.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line bg-surface/60 px-4 py-10 text-center">
                <p className="font-serif text-lg">Nada por aqui ainda</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
                  {filtro === 'TODOS'
                    ? 'Seja o primeiro a publicar um pedido de estudo, uma aula, link ou documento.'
                    : 'Nenhuma publicação deste tipo por enquanto. Experimente outro filtro.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {visiveis.map((publicacao) => (
                  <li key={publicacao.id}>
                    <CardPublicacao
                      publicacao={publicacao}
                      usuario={usuario}
                      curtindo={acao === `curtir:${publicacao.id}`}
                      comentando={acao === `comentar:${publicacao.id}`}
                      onCurtir={handleCurtir}
                      onComentar={handleComentar}
                      onSolicitarExclusao={setPublicacaoParaExcluir}
                      onVerPerfil={onVerPerfil}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <aside className="min-w-0 space-y-4">
        <ListaMembros usuarioId={usuario.id} onVerPerfil={onVerPerfil} />

        <section className={`${CARTAO} p-4`}>
          <h2 className="font-serif text-lg">Como participar</h2>
          <ul className="mt-2 space-y-2 text-xs leading-relaxed text-ink-muted">
            <li>
              <strong className="text-ink-soft">Pedido de estudo:</strong>{' '}
              encontre alguém para estudar junto.
            </li>
            <li>
              <strong className="text-ink-soft">Aula:</strong> compartilhe uma
              explicação ou material de aula.
            </li>
            <li>
              <strong className="text-ink-soft">Link:</strong> indique um
              conteúdo externo útil.
            </li>
            <li>
              <strong className="text-ink-soft">Documento:</strong> disponibilize
              um arquivo para a comunidade.
            </li>
          </ul>
        </section>
      </aside>

      {publicacaoParaExcluir && (
        <ModalConfirmacao
          titulo="Excluir publicação"
          mensagem="A publicação, seus comentários e curtidas serão removidos. Esta ação não pode ser desfeita."
          detalhe={
            detalheExclusao.length > 120
              ? `${detalheExclusao.slice(0, 120)}…`
              : detalheExclusao
          }
          rotuloConfirmar="Excluir publicação"
          carregando={acao === 'excluir-publicacao'}
          onConfirmar={handleConfirmarExclusao}
          onFechar={() => {
            if (acao !== 'excluir-publicacao') setPublicacaoParaExcluir(null)
          }}
        />
      )}
    </div>
  )
}
