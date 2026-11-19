import { useEffect, useState } from 'react'
import { Loader2, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import Comunidade from '../components/Comunidade'
import ConvitesPendentes from '../components/ConvitesPendentes'
import ListaGrupos from '../components/ListaGrupos'
import FormNovoGrupo from '../components/FormNovoGrupo'
import DetalheGrupo from '../components/DetalheGrupo'
import FeedbackBanner from '../components/FeedbackBanner'
import ModalConfirmacao from '../components/ModalConfirmacao'
import PerfilEdicaoModal from '../components/PerfilEdicaoModal'
import PerfilPublicoModal from '../components/PerfilPublicoModal'
import { mensagemDeErro } from '../services/api'
import { conectarTempoReal } from '../services/realtimeService'
import { BOTAO_PRIMARIO } from '../styles/ui'
import { PRIORIDADE_PADRAO } from '../utils/prioridades'
import {
  adicionarTopicoNoGrupo,
  atualizarTopicoNoGrupo,
  obterColunas,
} from '../utils/quadro'
import {
  adicionarTopico,
  alterarResponsavelTopico,
  convidarMembro,
  criarGrupo,
  excluirGrupo,
  listarConvitesPendentes,
  listarMeusGrupos,
  moverTopico,
  removerMembro,
  responderConvite,
} from '../services/grupoService'

function idSelecionadoValido(grupos, atual) {
  if (atual && grupos.some((grupo) => grupo.id === atual)) {
    return atual
  }

  return grupos[0]?.id ?? null
}

export default function Dashboard() {
  const { usuario, logout, atualizarUsuario } = useAuth()
  const { mostrarSucesso, mostrarErro } = useToast()
  const [grupos, setGrupos] = useState([])
  const [convites, setConvites] = useState([])
  const [grupoSelecionadoId, setGrupoSelecionadoId] = useState(null)
  const [formularioAberto, setFormularioAberto] = useState(false)
  const [perfilEdicaoAberto, setPerfilEdicaoAberto] = useState(false)
  const [perfilPublicoId, setPerfilPublicoId] = useState(null)
  const [carregandoInicial, setCarregandoInicial] = useState(true)
  const [erro, setErro] = useState('')
  const [acao, setAcao] = useState('')
  const [pagina, setPagina] = useState('quadro')
  const [confirmacao, setConfirmacao] = useState(null)

  const grupoSelecionado =
    grupos.find((grupo) => grupo.id === grupoSelecionadoId) ?? null

  const confirmando = acao === 'remover-membro' || acao === 'excluir-quadro'

  function aplicarDados(gruposCarregados, convitesCarregados, preferidoId) {
    setGrupos(gruposCarregados)
    setConvites(convitesCarregados)
    setGrupoSelecionadoId((atual) =>
      idSelecionadoValido(gruposCarregados, preferidoId ?? atual),
    )
  }

  async function recarregarDados(preferidoId) {
    const [gruposCarregados, convitesCarregados] = await Promise.all([
      listarMeusGrupos(),
      listarConvitesPendentes(),
    ])

    aplicarDados(gruposCarregados, convitesCarregados, preferidoId)
  }

  useEffect(() => {
    const desconectar = conectarTempoReal({
      onTopicoAtualizado: ({ grupoId, topico }) => {
        if (!grupoId || !topico?.id) return

        setGrupos((atuais) => atualizarTopicoNoGrupo(atuais, grupoId, topico))
      },
      onReconectado: () => {
        // Eventos perdidos durante a queda de conexão são recuperados pelo refetch.
        recarregarDados().catch(() => {})
      },
    })

    return desconectar
  }, [])

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const [gruposCarregados, convitesCarregados] = await Promise.all([
          listarMeusGrupos(),
          listarConvitesPendentes(),
        ])

        if (!ativo) return

        aplicarDados(gruposCarregados, convitesCarregados)
      } catch (err) {
        if (ativo) setErro(mensagemDeErro(err))
      } finally {
        if (ativo) setCarregandoInicial(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [])

  async function executarAcao(nome, tarefa) {
    setErro('')
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

  function handleNavegar(novaPagina) {
    setPagina(novaPagina)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCriarGrupo(dados) {
    return executarAcao('criar', async () => {
      const novoGrupo = await criarGrupo(dados)

      setGrupos((atuais) => [...atuais, novoGrupo])
      setGrupoSelecionadoId(novoGrupo.id)
      setFormularioAberto(false)
      mostrarSucesso('Quadro criado com sucesso.')
      return true
    })
  }

  function handleConvidar(email) {
    if (!grupoSelecionado) return Promise.resolve(false)

    const grupoId = grupoSelecionado.id

    return executarAcao('convite', async () => {
      await convidarMembro(grupoId, email)
      await recarregarDados()
      mostrarSucesso(`Convite enviado para ${email}.`)
      return true
    })
  }

  function handleResponderConvite(grupoId, aceitar) {
    return executarAcao('responder', async () => {
      await responderConvite(grupoId, aceitar)
      await recarregarDados(aceitar ? grupoId : undefined)
      mostrarSucesso(aceitar ? 'Convite aceito.' : 'Convite recusado.')
      return true
    })
  }

  function handleSolicitarRemocaoMembro(membro) {
    if (!grupoSelecionado) return

    setConfirmacao({
      tipo: 'membro',
      grupoId: grupoSelecionado.id,
      membroId: membro.usuarioId,
      nome: membro.nome,
      pendente: membro.status === 'Pendente',
    })
  }

  function handleSolicitarExclusaoQuadro() {
    if (!grupoSelecionado) return

    setConfirmacao({
      tipo: 'quadro',
      grupoId: grupoSelecionado.id,
      titulo: grupoSelecionado.titulo,
    })
  }

  function handleConfirmarRemocaoMembro() {
    if (confirmacao?.tipo !== 'membro') return Promise.resolve(false)

    const { grupoId, membroId, nome, pendente } = confirmacao

    return executarAcao('remover-membro', async () => {
      await removerMembro(grupoId, membroId)

      setGrupos((atuais) =>
        atuais.map((grupo) =>
          grupo.id === grupoId
            ? {
                ...grupo,
                membros: grupo.membros.filter(
                  (membro) => membro.usuarioId !== membroId,
                ),
                // O backend remove a atribuição; o estado local acompanha.
                topicos: grupo.topicos.map((topico) =>
                  topico.responsavelId === membroId
                    ? {
                        ...topico,
                        responsavelId: null,
                        responsavelNome: null,
                        responsavelFotoUrl: null,
                      }
                    : topico,
                ),
              }
            : grupo,
        ),
      )
      setConfirmacao(null)
      mostrarSucesso(
        pendente
          ? `Convite de ${nome || 'membro'} cancelado.`
          : `${nome || 'Membro'} foi removido do quadro.`,
      )
      return true
    })
  }

  function handleConfirmarExclusaoQuadro() {
    if (confirmacao?.tipo !== 'quadro') return Promise.resolve(false)

    const { grupoId, titulo } = confirmacao

    return executarAcao('excluir-quadro', async () => {
      await excluirGrupo(grupoId)

      const restantes = grupos.filter((grupo) => grupo.id !== grupoId)

      setGrupos(restantes)
      setGrupoSelecionadoId((atual) =>
        atual === grupoId ? (restantes[0]?.id ?? null) : atual,
      )
      setConfirmacao(null)
      mostrarSucesso(`Quadro “${titulo}” excluído.`)
      return true
    })
  }

  function fecharConfirmacao() {
    if (acao !== 'remover-membro' && acao !== 'excluir-quadro') {
      setConfirmacao(null)
    }
  }

  function atualizarTopico(grupoId, topicoId, atualizar) {
    setGrupos((atuais) =>
      atuais.map((grupo) =>
        grupo.id === grupoId
          ? {
              ...grupo,
              topicos: grupo.topicos.map((topico) =>
                topico.id === topicoId ? atualizar(topico) : topico,
              ),
            }
          : grupo,
      ),
    )
  }

  function handleAdicionarTopico(dados) {
    if (!grupoSelecionado) return Promise.resolve(false)

    const grupoId = grupoSelecionado.id

    return executarAcao('topico', async () => {
      const criado = await adicionarTopico(grupoId, dados)
      const novoTopico = {
        ...criado,
        prioridade: criado.prioridade ?? dados.prioridade ?? PRIORIDADE_PADRAO,
        responsavelId:
          criado.responsavelId !== undefined
            ? criado.responsavelId
            : (dados.responsavelId ?? null),
      }

      setGrupos((atuais) => adicionarTopicoNoGrupo(atuais, grupoId, novoTopico))
      mostrarSucesso('Card adicionado.')
      return true
    })
  }

  function handlePerfilSalvo(perfil) {
    atualizarUsuario({ nome: perfil.nome, fotoUrl: perfil.fotoUrl })
    setPerfilEdicaoAberto(false)
    mostrarSucesso('Perfil atualizado com sucesso.')
  }

  function handleMoverTopico(topicoId, colunaId, ordem) {
    if (!grupoSelecionado) return Promise.resolve(false)

    const grupoId = grupoSelecionado.id
    const topicoAnterior = grupoSelecionado.topicos.find(
      (topico) => topico.id === topicoId,
    )

    if (!topicoAnterior) return Promise.resolve(false)

    return executarAcao('mover', async () => {
      atualizarTopico(grupoId, topicoId, (topico) => ({
        ...topico,
        colunaId,
        ordem,
      }))

      try {
        const resposta = await moverTopico(topicoId, { colunaId, ordem })

        if (resposta) {
          atualizarTopico(grupoId, topicoId, (topico) => ({
            ...topico,
            ...resposta,
            colunaId: resposta.colunaId ?? colunaId,
            ordem: resposta.ordem ?? ordem,
          }))
        }

        const tituloColuna = obterColunas(grupoSelecionado).find(
          (coluna) => coluna.id === colunaId,
        )?.titulo

        if (tituloColuna) mostrarSucesso(`Card movido para ${tituloColuna}.`)

        return true
      } catch (err) {
        atualizarTopico(grupoId, topicoId, () => topicoAnterior)
        throw err
      }
    })
  }

  function handleAlterarResponsavel(topicoId, responsavelId) {
    if (!grupoSelecionado) return Promise.resolve(false)

    const grupoId = grupoSelecionado.id
    const topicoAnterior = grupoSelecionado.topicos.find(
      (topico) => topico.id === topicoId,
    )

    if (!topicoAnterior) return Promise.resolve(false)

    return executarAcao('responsavel', async () => {
      atualizarTopico(grupoId, topicoId, (topico) => ({
        ...topico,
        responsavelId,
      }))

      try {
        const resposta = await alterarResponsavelTopico(
          topicoId,
          responsavelId,
        )

        if (resposta) {
          atualizarTopico(grupoId, topicoId, (topico) => ({
            ...topico,
            ...resposta,
            responsavelId:
              resposta.responsavelId !== undefined
                ? resposta.responsavelId
                : responsavelId,
          }))
        }

        mostrarSucesso('Responsável atualizado.')
        return true
      } catch (err) {
        atualizarTopico(grupoId, topicoId, () => topicoAnterior)
        throw err
      }
    })
  }

  if (carregandoInicial) {
    return (
      <div id="topo" className="min-h-screen bg-page text-ink">
        <Navbar
          usuario={usuario}
          paginaAtiva={pagina}
          carregando
          onNavegar={() => {}}
          onSair={logout}
          onAbrirPerfil={() => setPerfilEdicaoAberto(true)}
        />
        <div className="flex min-h-72 items-center justify-center px-4">
          <Loader2
            aria-hidden="true"
            size={28}
            className="motion-safe:animate-spin text-brand"
          />
          <span className="sr-only">Carregando dashboard</span>
        </div>

        {perfilEdicaoAberto && (
          <PerfilEdicaoModal
            onFechar={() => setPerfilEdicaoAberto(false)}
            onSalvo={handlePerfilSalvo}
          />
        )}
      </div>
    )
  }

  return (
    <div id="topo" className="min-h-screen bg-page text-ink">
      <Navbar
        usuario={usuario}
        paginaAtiva={pagina}
        onNavegar={handleNavegar}
        onSair={logout}
        onAbrirPerfil={() => setPerfilEdicaoAberto(true)}
      />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
        <FeedbackBanner
          tipo="erro"
          mensagem={erro}
          onFechar={() => setErro('')}
          className="mb-4"
        />

        {pagina === 'comunidade' ? (
          <main className="min-w-0">
            <Comunidade usuario={usuario} onVerPerfil={setPerfilPublicoId} />
          </main>
        ) : pagina === 'convite' ? (
          <main className="mx-auto w-full max-w-3xl">
            <ConvitesPendentes
              convites={convites}
              respondendo={acao === 'responder'}
              onResponder={handleResponderConvite}
            />
          </main>
        ) : (
          <main className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <aside className="min-w-0 space-y-4">
              <ListaGrupos
                grupos={grupos}
                selecionadoId={grupoSelecionadoId}
                onSelecionar={setGrupoSelecionadoId}
                formularioAberto={formularioAberto}
                onAlternarFormulario={() => setFormularioAberto((aberto) => !aberto)}
              />

              <FormNovoGrupo
                aberto={formularioAberto}
                criando={acao === 'criar'}
                onCriar={handleCriarGrupo}
              />
            </aside>

            <div className="min-w-0">
              {grupoSelecionado ? (
                <DetalheGrupo
                  grupo={grupoSelecionado}
                  usuario={usuario}
                  acao={acao}
                  onConvidar={handleConvidar}
                  onAdicionarTopico={handleAdicionarTopico}
                  onMoverTopico={handleMoverTopico}
                  onAlterarResponsavel={handleAlterarResponsavel}
                  onVerPerfil={setPerfilPublicoId}
                  onRemoverMembro={handleSolicitarRemocaoMembro}
                  onExcluirQuadro={handleSolicitarExclusaoQuadro}
                />
              ) : (
                <div className="flex min-h-72 flex-col items-start justify-center rounded-lg border border-dashed border-line px-6 py-8">
                  <Users aria-hidden="true" size={22} className="text-ink-faint" />
                  <p className="mt-3 text-sm font-medium text-ink">
                    Nenhum quadro selecionado.
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Selecione um quadro na lista.
                  </p>
                  {grupos.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setFormularioAberto(true)}
                      className={`${BOTAO_PRIMARIO} mt-4 px-3 py-2 text-sm`}
                    >
                      Criar quadro
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      {perfilEdicaoAberto && (
        <PerfilEdicaoModal
          onFechar={() => setPerfilEdicaoAberto(false)}
          onSalvo={handlePerfilSalvo}
        />
      )}

      {perfilPublicoId && (
        <PerfilPublicoModal
          usuarioId={perfilPublicoId}
          onFechar={() => setPerfilPublicoId(null)}
        />
      )}

      {confirmacao && (
        <ModalConfirmacao
          titulo={
            confirmacao.tipo === 'membro'
              ? confirmacao.pendente
                ? 'Cancelar convite'
                : 'Remover membro'
              : 'Excluir quadro'
          }
          mensagem={
            confirmacao.tipo === 'membro'
              ? confirmacao.pendente
                ? 'O convite pendente será cancelado e a pessoa não poderá mais entrar no quadro por ele.'
                : 'A pessoa perderá o acesso ao quadro. Os cards atribuídos a ela ficarão sem responsável.'
              : 'Todos os cards, colunas e membros deste quadro serão removidos. Esta ação não pode ser desfeita.'
          }
          detalhe={
            confirmacao.tipo === 'membro'
              ? confirmacao.nome || 'Membro do quadro'
              : confirmacao.titulo
          }
          rotuloConfirmar={
            confirmacao.tipo === 'membro'
              ? confirmacao.pendente
                ? 'Cancelar convite'
                : 'Remover membro'
              : 'Excluir quadro'
          }
          carregando={confirmando}
          onConfirmar={
            confirmacao.tipo === 'membro'
              ? handleConfirmarRemocaoMembro
              : handleConfirmarExclusaoQuadro
          }
          onFechar={fecharConfirmacao}
        />
      )}
    </div>
  )
}
