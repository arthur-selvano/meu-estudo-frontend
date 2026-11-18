import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import DashboardHeader from '../components/DashboardHeader'
import ConvitesPendentes from '../components/ConvitesPendentes'
import ListaGrupos from '../components/ListaGrupos'
import FormNovoGrupo from '../components/FormNovoGrupo'
import DetalheGrupo from '../components/DetalheGrupo'
import {
  adicionarTopico,
  alternarConclusaoTopico,
  convidarMembro,
  criarGrupo,
  listarConvitesPendentes,
  listarMeusGrupos,
  responderConvite,
} from '../services/grupoService'

const MENSAGEM_PADRAO = 'Não foi possível concluir a ação. Tente novamente.'

function mensagemDeErro(err) {
  return err.response?.data?.erro || MENSAGEM_PADRAO
}

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

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const [gruposCarregados, convitesCarregados] = await Promise.all([
          listarMeusGrupos(),
          listarConvitesPendentes(),
        ])

        if (!ativo) return

        setGrupos(gruposCarregados)
        setConvites(convitesCarregados)
        setGrupoSelecionadoId((atual) =>
          idSelecionadoValido(gruposCarregados, atual),
        )
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

  async function handleCriarGrupo(dados) {
    setErro('')
    setSucesso('')
    setAcao('criar')

    try {
      const novoGrupo = await criarGrupo(dados)
      setGrupos((atuais) => [...atuais, novoGrupo])
      setGrupoSelecionadoId(novoGrupo.id)
      setFormularioAberto(false)
      setSucesso('Grupo criado com sucesso.')
      return true
    } catch (err) {
      setErro(mensagemDeErro(err))
      return false
    } finally {
      setAcao('')
    }
  }

  async function handleConvidar(email) {
    if (!grupoSelecionado) return false

    const grupoId = grupoSelecionado.id
    setErro('')
    setSucesso('')
    setAcao('convite')

    try {
      await convidarMembro(grupoId, email)
      const gruposAtualizados = await listarMeusGrupos()
      setGrupos(gruposAtualizados)
      setGrupoSelecionadoId((atual) =>
        idSelecionadoValido(gruposAtualizados, atual),
      )
      setSucesso(`Convite enviado para ${email}.`)
      return true
    } catch (err) {
      setErro(mensagemDeErro(err))
      return false
    } finally {
      setAcao('')
    }
  }

  async function handleResponderConvite(grupoId, aceitar) {
    setErro('')
    setSucesso('')
    setAcao('responder')

    try {
      await responderConvite(grupoId, aceitar)

      const [gruposAtualizados, convitesAtualizados] = await Promise.all([
        listarMeusGrupos(),
        listarConvitesPendentes(),
      ])

      setGrupos(gruposAtualizados)
      setConvites(convitesAtualizados)
      setGrupoSelecionadoId((atual) =>
        idSelecionadoValido(gruposAtualizados, aceitar ? grupoId : atual),
      )
      setSucesso(aceitar ? 'Convite aceito.' : 'Convite recusado.')
      return true
    } catch (err) {
      setErro(mensagemDeErro(err))
      return false
    } finally {
      setAcao('')
    }
  }

  async function handleAdicionarTopico(dados) {
    if (!grupoSelecionado) return false

    const grupoId = grupoSelecionado.id
    setErro('')
    setSucesso('')
    setAcao('topico')

    try {
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
    } catch (err) {
      setErro(mensagemDeErro(err))
      return false
    } finally {
      setAcao('')
    }
  }

  async function handleAlternarTopico(topicoId) {
    if (!grupoSelecionado) return false

    const grupoId = grupoSelecionado.id
    setErro('')
    setSucesso('')
    setAcao('toggle')

    try {
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
    } catch (err) {
      setErro(mensagemDeErro(err))
      return false
    } finally {
      setAcao('')
    }
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
        {erro && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-lg border border-[#E3C4B5] bg-[#FBEDE7] px-3.5 py-3 text-sm text-[#8A3B1E]"
          >
            <AlertCircle
              aria-hidden="true"
              size={18}
              className="mt-0.5 shrink-0"
            />
            <p className="flex-1 leading-snug">{erro}</p>
            <button
              type="button"
              onClick={() => setErro('')}
              aria-label="Fechar mensagem de erro"
              className="rounded p-0.5 hover:bg-[#F3D9CE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A3B1E]/30"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>
        )}

        {sucesso && (
          <div
            role="status"
            className="mb-4 flex items-start gap-2.5 rounded-lg border border-[#B7D2B4] bg-[#E3EFE0] px-3.5 py-3 text-sm text-[#245B34]"
          >
            <CheckCircle2
              aria-hidden="true"
              size={18}
              className="mt-0.5 shrink-0"
            />
            <p className="flex-1 leading-snug">{sucesso}</p>
            <button
              type="button"
              onClick={() => setSucesso('')}
              aria-label="Fechar mensagem de sucesso"
              className="rounded p-0.5 hover:bg-[#D2E4CE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245B34]/30"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>
        )}

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
                <Users
                  aria-hidden="true"
                  size={26}
                  className="text-[#8A9A8F]"
                />
                <p className="mt-3 font-serif text-xl">Selecione um grupo</p>
                <p className="mt-1 max-w-xs text-sm text-[#6B7D71]">
                  Escolha um grupo na lista ou crie o primeiro para começar.
                </p>
                {grupos.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setFormularioAberto(true)}
                    className="mt-4 rounded-lg bg-[#173D2E] px-4 py-2.5 text-sm font-semibold text-[#F4F6F0] transition-colors hover:bg-[#1F4D3A] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/25"
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
