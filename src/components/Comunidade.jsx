import { useEffect, useState } from 'react'
import { Loader2, Plus, RefreshCw, Search } from 'lucide-react'
import Avatar from './Avatar'
import CardPublicacao from './CardPublicacao'
import ComposerPublicacao from './ComposerPublicacao'
import FeedbackBanner from './FeedbackBanner'
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
import { listarPerfisPublicos } from '../services/perfilService'
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO_ICONE } from '../styles/ui'
import { TIPOS_PUBLICACAO } from '../utils/publicacoes'

const FILTROS = [
  { valor: 'TODOS', rotulo: 'Todos' },
  ...TIPOS_PUBLICACAO.map((tipo) => ({
    valor: tipo.valor,
    rotulo: tipo.rotulo,
  })),
]

function correspondeAoTermo(perfil, termo) {
  return [
    perfil.nome,
    perfil.cursoOuArea,
    perfil.instituicao,
    ...(perfil.topicosInteresse ?? []),
    ...(perfil.topicosAjuda ?? []),
  ]
    .filter(Boolean)
    .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
}

export default function Comunidade({ usuario, onVerPerfil }) {
  const { mostrarSucesso, mostrarErro } = useToast()
  const [publicacoes, setPublicacoes] = useState([])
  const [membros, setMembros] = useState([])
  const [filtro, setFiltro] = useState('TODOS')
  const [busca, setBusca] = useState('')
  const [composerAberto, setComposerAberto] = useState(false)
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

  useEffect(() => {
    let ativo = true

    listarPerfisPublicos()
      .then((dados) => {
        if (ativo) setMembros(dados)
      })
      .catch(() => {})

    return () => {
      ativo = false
    }
  }, [])

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
      setComposerAberto(false)
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

  const termo = busca.trim().toLocaleLowerCase('pt-BR')

  const visiveis = (
    filtro === 'TODOS'
      ? publicacoes
      : publicacoes.filter((publicacao) => publicacao.tipo === filtro)
  ).filter(
    (publicacao) =>
      !termo ||
      [publicacao.titulo, publicacao.conteudo, publicacao.autorNome]
        .filter(Boolean)
        .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo)),
  )

  const membrosFiltrados = termo
    ? membros.filter((membro) => correspondeAoTermo(membro, termo)).slice(0, 5)
    : []

  const detalheExclusao = publicacaoParaExcluir
    ? publicacaoParaExcluir.titulo || publicacaoParaExcluir.conteudo
    : ''

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setComposerAberto((aberto) => !aberto)}
          className={`${BOTAO_PRIMARIO} h-9 shrink-0 px-3 text-sm`}
        >
          <Plus aria-hidden="true" size={15} />
          {composerAberto ? 'Fechar' : 'Nova publicação'}
        </button>

        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <label htmlFor="busca-comunidade" className="sr-only">
            Buscar publicações ou membros
          </label>
          <input
            id="busca-comunidade"
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar publicações ou membros"
            className={`${CAMPO_ICONE} py-2 text-sm`}
          />

          {membrosFiltrados.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-line bg-surface p-1">
              {membrosFiltrados.map((membro) => {
                const doAutor = publicacoes.filter(
                  (publicacao) => publicacao.autorId === membro.id,
                )
                const interacoes = doAutor.reduce(
                  (total, publicacao) =>
                    total +
                    (publicacao.curtidas ?? 0) +
                    (publicacao.comentarios?.length ?? 0),
                  0,
                )

                return (
                  <li key={membro.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setBusca('')
                        onVerPerfil(membro.id)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
                    >
                      <Avatar
                        nome={membro.nome}
                        fotoUrl={membro.fotoUrl}
                        tamanho="sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {membro.nome}
                        </span>
                        <span className="block truncate text-xs text-ink-muted">
                          {doAutor.length}{' '}
                          {doAutor.length === 1 ? 'publicação' : 'publicações'} ·{' '}
                          {interacoes}{' '}
                          {interacoes === 1 ? 'interação' : 'interações'}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {composerAberto && (
        <ComposerPublicacao
          usuario={usuario}
          publicando={acao === 'publicar'}
          onPublicar={handlePublicar}
        />
      )}

      <div className="flex flex-wrap gap-1.5">
        {FILTROS.map((opcao) => {
          const ativo = filtro === opcao.valor

          return (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => setFiltro(opcao.valor)}
              aria-pressed={ativo}
              className={`min-h-8 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 ${
                ativo
                  ? 'border-field-line bg-surface-hover text-ink'
                  : 'border-line bg-surface text-ink-soft hover:bg-surface-hover'
              }`}
            >
              {opcao.rotulo}
            </button>
          )
        })}
      </div>

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
        <div className="rounded-lg border border-dashed border-line px-4 py-8">
          <p className="text-sm font-medium text-ink">Nenhuma publicação.</p>
          <p className="mt-1 text-sm text-ink-muted">
            {termo
              ? 'Ajuste a busca ou o filtro.'
              : filtro === 'TODOS'
                ? 'Publique um pedido de estudo, aula, link ou documento.'
                : 'Nenhuma publicação deste tipo.'}
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
