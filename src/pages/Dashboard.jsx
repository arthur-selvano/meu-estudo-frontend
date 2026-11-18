import { useEffect, useState } from 'react'
import { Loader2, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import DashboardHeader from '../components/DashboardHeader'
import ConvitesPendentes from '../components/ConvitesPendentes'
import ListaGrupos from '../components/ListaGrupos'
import FormNovoGrupo from '../components/FormNovoGrupo'
import DetalheGrupo from '../components/DetalheGrupo'
import FeedbackBanner from '../components/FeedbackBanner'
import { mensagemDeErro } from '../services/api'
import { BOTAO_PRIMARIO } from '../styles/ui'
import {
  adicionarTopico,
  alternarConclusaoTopico,
  convidarMembro,
  criarGrupo,
  listarConvitesPendentes,
  listarMeusGrupos,
  responderConvite,
} from '../services/grupoService'

function idSelecionadoValido(grupos, atual) {
  if (atual && grupos.some((grupo) => grupo.id === atual)) {
    return atual
  }

  return grupos[0]?.id ?? null
}

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const [grupos, setGrupos] = useState([])
  const [convites, setConvites] = useState([])
  const [grupoSelecionadoId, setGrupoSelecionadoId] = useState(null)
  const [formularioAberto, setFormularioAberto] = useState(false)
  const [carregandoInicial, setCarregandoInicial] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [acao, setAcao] = useState('')

  const grupoSelecionado =
    grupos.find((grupo) => grupo.id === grupoSelecionadoId) ?? null

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
    setSucesso('')
    setAcao(nome)

    try {
      return await tarefa()
    } catch (err) {
      setErro(mensagemDeErro(err))
      return false
    } finally {
      setAcao('')
    }
  }

  function handleCriarGrupo(dados) {
    return executarAcao('criar', async () => {
      const novoGrupo = await criarGrupo(dados)

      setGrupos((atuais) => [...atuais, novoGrupo])
      setGrupoSelecionadoId(novoGrupo.id)
      setFormularioAberto(false)
      setSucesso('Grupo criado com sucesso.')
      return true
    })
  }

  function handleConvidar(email) {
    if (!grupoSelecionado) return Promise.resolve(false)

    const grupoId = grupoSelecionado.id

    return executarAcao('convite', async () => {
      await convidarMembro(grupoId, email)
      await recarregarDados()
      setSucesso(`Convite enviado para ${email}.`)
      return true
    })
  }

  function handleResponderConvite(grupoId, aceitar) {
    return executarAcao('responder', async () => {
      await responderConvite(grupoId, aceitar)
      await recarregarDados(aceitar ? grupoId : undefined)
      setSucesso(aceitar ? 'Convite aceito.' : 'Convite recusado.')
      return true
    })
  }

  function handleAdicionarTopico(dados) {
    if (!grupoSelecionado) return Promise.resolve(false)

    const grupoId = grupoSelecionado.id

    return executarAcao('topico', async () => {
      const novoTopico = await adicionarTopico(grupoId, dados)

      setGrupos((atuais) =>
        atuais.map((grupo) =>
          grupo.id === grupoId
            ? { ...grupo, topicos: [...grupo.topicos, novoTopico] }
            : grupo,
        ),
      )
      setSucesso('Tópico adicionado.')
      return true
    })
  }

  function handleAlternarTopico(topicoId) {
    if (!grupoSelecionado) return Promise.resolve(false)

    const grupoId = grupoSelecionado.id

    return executarAcao('toggle', async () => {
      const topicoAtualizado = await alternarConclusaoTopico(grupoId, topicoId)

      setGrupos((atuais) =>
        atuais.map((grupo) =>
          grupo.id === grupoId
            ? {
                ...grupo,
                topicos: grupo.topicos.map((topico) =>
                  topico.id === topicoId ? topicoAtualizado : topico,
                ),
              }
            : grupo,
        ),
      )
      return true
    })
  }

  if (carregandoInicial) {
    return (
      <div className="min-h-screen bg-[#F4F6F0] text-[#12251D]">
        <DashboardHeader nome={usuario.nome} onSair={logout} />
        <div className="flex min-h-72 items-center justify-center px-4">
          <Loader2
            aria-hidden="true"
            size={28}
            className="motion-safe:animate-spin text-[#2F6F4E]"
          />
          <span className="sr-only">Carregando dashboard</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F0] text-[#12251D]">
      <DashboardHeader nome={usuario.nome} onSair={logout} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <FeedbackBanner
          tipo="erro"
          mensagem={erro}
          onFechar={() => setErro('')}
          className="mb-4"
        />
        <FeedbackBanner
          tipo="sucesso"
          mensagem={sucesso}
          onFechar={() => setSucesso('')}
          className="mb-4"
        />

        <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <ConvitesPendentes
              convites={convites}
              respondendo={acao === 'responder'}
              onResponder={handleResponderConvite}
            />

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

          <main>
            {grupoSelecionado ? (
              <DetalheGrupo
                grupo={grupoSelecionado}
                usuario={usuario}
                acao={acao}
                onConvidar={handleConvidar}
                onAdicionarTopico={handleAdicionarTopico}
                onAlternarTopico={handleAlternarTopico}
              />
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD6C8] bg-white/60 p-8 text-center">
                <Users aria-hidden="true" size={26} className="text-[#8A9A8F]" />
                <p className="mt-3 font-serif text-xl">Selecione um grupo</p>
                <p className="mt-1 max-w-xs text-sm text-[#6B7D71]">
                  Escolha um grupo na lista ou crie o primeiro para começar.
                </p>
                {grupos.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setFormularioAberto(true)}
                    className={`${BOTAO_PRIMARIO} mt-4 px-4 py-2.5 text-sm`}
                  >
                    Criar grupo
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
