import { useEffect, useState } from 'react'
import { ImagePlus, Loader2, Mail, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import FeedbackBanner from './FeedbackBanner'
import Modal from './Modal'
import ModalConfirmacao from './ModalConfirmacao'
import SeletorTopicos from './SeletorTopicos'
import { mensagemDeErro } from '../services/api'
import {
  atualizarPerfil,
  enviarFoto,
  obterMeuPerfil,
} from '../services/perfilService'
import {
  BOTAO_PRIMARIO,
  BOTAO_SECUNDARIO,
  CAMPO,
  ROTULO,
} from '../styles/ui'

const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024
const TIPOS_DE_FOTO = ['image/jpeg', 'image/png', 'image/webp']

const LIMITE_NOME = 120
const LIMITE_BIO = 500
const LIMITE_CURSO = 120
const LIMITE_INSTITUICAO = 150

function topicosIguais(a, b) {
  const normalizar = (lista) =>
    [...(lista ?? [])]
      .map((topico) => topico.toLocaleLowerCase('pt-BR'))
      .sort()

  const primeiro = normalizar(a)
  const segundo = normalizar(b)

  return (
    primeiro.length === segundo.length &&
    primeiro.every((topico, indice) => topico === segundo[indice])
  )
}

function Contador({ atual, maximo }) {
  return (
    <span
      className={`text-xs ${
        atual >= maximo ? 'font-medium text-warning-ink' : 'text-ink-muted'
      }`}
    >
      {atual}/{maximo}
    </span>
  )
}

function Secao({ id, titulo, descricao, children }) {
  return (
    <section
      aria-labelledby={id}
      className="border-t border-line-soft pt-5"
    >
      <h3 id={id} className="text-sm font-semibold text-ink">
        {titulo}
      </h3>
      {descricao && <p className="mt-0.5 text-xs text-ink-muted">{descricao}</p>}
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  )
}

export default function PerfilEdicaoModal({ onFechar, onSalvo }) {
  const { atualizarUsuario } = useAuth()

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [perfil, setPerfil] = useState(null)
  const [confirmarDescarte, setConfirmarDescarte] = useState(false)

  const [nome, setNome] = useState('')
  const [bio, setBio] = useState('')
  const [cursoOuArea, setCursoOuArea] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [topicosInteresse, setTopicosInteresse] = useState([])
  const [topicosAjuda, setTopicosAjuda] = useState([])

  const [arquivoFoto, setArquivoFoto] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const dados = await obterMeuPerfil()

        if (!ativo) return

        setPerfil(dados)
        setNome(dados.nome ?? '')
        setBio(dados.bio ?? '')
        setCursoOuArea(dados.cursoOuArea ?? '')
        setInstituicao(dados.instituicao ?? '')
        setTopicosInteresse(dados.topicosInteresse ?? [])
        setTopicosAjuda(dados.topicosAjuda ?? [])
      } catch (err) {
        if (ativo) {
          setErro(
            mensagemDeErro(err, 'Não foi possível carregar seu perfil.'),
          )
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    if (!previewUrl) return undefined

    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const alterado =
    Boolean(perfil) &&
    (nome.trim() !== (perfil.nome ?? '').trim() ||
      bio !== (perfil.bio ?? '') ||
      cursoOuArea !== (perfil.cursoOuArea ?? '') ||
      instituicao !== (perfil.instituicao ?? '') ||
      !topicosIguais(topicosInteresse, perfil.topicosInteresse) ||
      !topicosIguais(topicosAjuda, perfil.topicosAjuda) ||
      Boolean(arquivoFoto))

  function handleFechar() {
    if (salvando) return

    if (alterado) {
      setConfirmarDescarte(true)
      return
    }

    onFechar()
  }

  function descartarFoto() {
    setArquivoFoto(null)
    setPreviewUrl(null)
  }

  function handleArquivo(event) {
    const arquivo = event.target.files?.[0]
    event.target.value = ''

    if (!arquivo) return

    if (!TIPOS_DE_FOTO.includes(arquivo.type)) {
      setErro('Escolha uma imagem JPEG, PNG ou WebP.')
      return
    }

    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      setErro('A foto deve ter no máximo 2 MB.')
      return
    }

    setErro('')
    setArquivoFoto(arquivo)
    setPreviewUrl(URL.createObjectURL(arquivo))
  }

  async function handleSalvar(event) {
    event.preventDefault()

    if (salvando || !perfil) return

    if (!nome.trim()) {
      setErro('O nome é obrigatório.')
      return
    }

    setErro('')
    setSalvando(true)

    try {
      if (arquivoFoto) {
        const { fotoUrl } = await enviarFoto(arquivoFoto)
        atualizarUsuario({ fotoUrl })
      }

      const atualizado = await atualizarPerfil({
        nome: nome.trim(),
        bio: bio.trim() || null,
        cursoOuArea: cursoOuArea.trim() || null,
        instituicao: instituicao.trim() || null,
        topicosInteresse,
        topicosAjuda,
      })

      atualizarUsuario({ nome: atualizado.nome, fotoUrl: atualizado.fotoUrl })
      onSalvo(atualizado)
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      labelledBy="titulo-edicao-perfil"
      onFechar={handleFechar}
      bloqueado={salvando}
      className="max-w-2xl"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line-soft bg-surface-muted px-4 py-4 sm:px-5">
        <div>
          <h2
            id="titulo-edicao-perfil"
            className="text-lg font-semibold leading-tight"
          >
            Meu perfil
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Visível para membros dos seus quadros.
          </p>
        </div>
        <button
          type="button"
          onClick={handleFechar}
          disabled={salvando}
          aria-label="Fechar edição de perfil"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-1.5 text-ink-secondary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:opacity-50"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      {carregando ? (
        <div className="flex min-h-56 items-center justify-center">
          <Loader2
            aria-hidden="true"
            size={26}
            className="motion-safe:animate-spin text-brand"
          />
          <span className="sr-only">Carregando perfil</span>
        </div>
      ) : !perfil ? (
        <div className="space-y-4 px-4 py-6 sm:px-5">
          <FeedbackBanner tipo="erro" mensagem={erro} />
          <button
            type="button"
            onClick={onFechar}
            className={`${BOTAO_SECUNDARIO} px-4 py-2.5 text-sm`}
          >
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSalvar} className="px-4 py-5 sm:px-5">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line-soft bg-surface p-4">
              <Avatar
                nome={nome || perfil.nome}
                fotoUrl={previewUrl ?? perfil.fotoUrl}
                tamanho="xl"
              />

              <div className="min-w-0 flex-1">
                <p className="break-words text-base font-semibold leading-tight">
                  {nome.trim() || perfil.nome}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 break-words text-xs text-ink-muted">
                  <Mail aria-hidden="true" size={13} className="shrink-0" />
                  {perfil.email}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    id="foto-perfil"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleArquivo}
                    disabled={salvando}
                    className="sr-only"
                  />
                  <label
                    htmlFor="foto-perfil"
                    className={`${BOTAO_SECUNDARIO} cursor-pointer px-3 py-2 text-sm ${
                      salvando ? 'pointer-events-none opacity-60' : ''
                    }`}
                  >
                    <ImagePlus aria-hidden="true" size={16} />
                    {previewUrl ? 'Escolher outra foto' : 'Trocar foto'}
                  </label>

                  {previewUrl && (
                    <button
                      type="button"
                      onClick={descartarFoto}
                      disabled={salvando}
                      className={`${BOTAO_SECUNDARIO} px-3 py-2 text-sm`}
                    >
                      <X aria-hidden="true" size={16} />
                      Descartar seleção
                    </button>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-ink-muted">
                  JPEG, PNG ou WebP, até 2 MB.
                </p>
              </div>
            </div>

            <FeedbackBanner
              tipo="erro"
              mensagem={erro}
              onFechar={() => setErro('')}
            />

            <Secao id="secao-dados-pessoais" titulo="Dados pessoais">
              <div>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <label htmlFor="perfil-nome" className={`${ROTULO} mb-0`}>
                    Nome
                  </label>
                  <Contador atual={nome.length} maximo={LIMITE_NOME} />
                </div>
                <input
                  id="perfil-nome"
                  type="text"
                  required
                  maxLength={LIMITE_NOME}
                  disabled={salvando}
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className={CAMPO}
                />
              </div>

              <div>
                <label htmlFor="perfil-email" className={ROTULO}>
                  E-mail
                </label>
                <input
                  id="perfil-email"
                  type="email"
                  disabled
                  value={perfil.email}
                  className={CAMPO}
                />
                <p className="mt-1 text-xs text-ink-muted">
                  O e-mail não pode ser alterado.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <label htmlFor="perfil-curso" className={`${ROTULO} mb-0`}>
                      Curso ou área
                    </label>
                    <Contador atual={cursoOuArea.length} maximo={LIMITE_CURSO} />
                  </div>
                  <input
                    id="perfil-curso"
                    type="text"
                    maxLength={LIMITE_CURSO}
                    disabled={salvando}
                    value={cursoOuArea}
                    onChange={(event) => setCursoOuArea(event.target.value)}
                    placeholder="Ex.: Engenharia de Software"
                    className={CAMPO}
                  />
                </div>

                <div className="min-w-0">
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <label
                      htmlFor="perfil-instituicao"
                      className={`${ROTULO} mb-0`}
                    >
                      Instituição
                    </label>
                    <Contador
                      atual={instituicao.length}
                      maximo={LIMITE_INSTITUICAO}
                    />
                  </div>
                  <input
                    id="perfil-instituicao"
                    type="text"
                    maxLength={LIMITE_INSTITUICAO}
                    disabled={salvando}
                    value={instituicao}
                    onChange={(event) => setInstituicao(event.target.value)}
                    placeholder="Ex.: Universidade X"
                    className={CAMPO}
                  />
                </div>
              </div>
            </Secao>

            <Secao id="secao-sobre" titulo="Sobre você">
              <div>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <label htmlFor="perfil-bio" className={`${ROTULO} mb-0`}>
                    Biografia
                  </label>
                  <Contador atual={bio.length} maximo={LIMITE_BIO} />
                </div>
                <textarea
                  id="perfil-bio"
                  rows={4}
                  maxLength={LIMITE_BIO}
                  disabled={salvando}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="O que você está estudando, seus objetivos..."
                  className={`${CAMPO} resize-y`}
                />
              </div>
            </Secao>

            <Secao
              id="secao-estudos"
              titulo="Interesses e colaboração"
              descricao="Até 10 tópicos por lista."
            >
              <SeletorTopicos
                id="topicos-interesse"
                rotulo="Quero estudar"
                descricao="Tópicos que você quer aprender ou aprofundar."
                selecionados={topicosInteresse}
                onChange={setTopicosInteresse}
                desabilitado={salvando}
              />

              <SeletorTopicos
                id="topicos-ajuda"
                rotulo="Posso ajudar"
                descricao="Tópicos em que você pode ajudar outros membros."
                selecionados={topicosAjuda}
                onChange={setTopicosAjuda}
                desabilitado={salvando}
              />
            </Secao>
          </div>

          <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-col-reverse gap-2 border-t border-line-soft bg-surface-muted px-4 py-3 sm:-mx-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-ink-muted" aria-live="polite">
              {alterado ? 'Você tem alterações não salvas.' : 'Sem alterações.'}
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleFechar}
                disabled={salvando}
                className={`${BOTAO_SECUNDARIO} min-h-11 w-full px-4 py-2.5 text-sm sm:w-auto`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                aria-busy={salvando}
                className={`${BOTAO_PRIMARIO} min-h-11 w-full px-4 py-2.5 text-sm sm:w-auto`}
              >
                {salvando && (
                  <Loader2
                    aria-hidden="true"
                    size={16}
                    className="motion-safe:animate-spin"
                  />
                )}
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </form>
      )}

      {confirmarDescarte && (
        <ModalConfirmacao
          titulo="Descartar alterações?"
          mensagem="As informações editadas e a foto selecionada serão perdidas."
          detalhe="Essa ação não pode ser desfeita."
          rotuloConfirmar="Descartar"
          onConfirmar={() => {
            setConfirmarDescarte(false)
            onFechar()
          }}
          onFechar={() => setConfirmarDescarte(false)}
        />
      )}
    </Modal>
  )
}
