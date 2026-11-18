import { useEffect, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import FeedbackBanner from './FeedbackBanner'
import Modal from './Modal'
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

export default function PerfilEdicaoModal({ onFechar, onSalvo }) {
  const { atualizarUsuario } = useAuth()

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [perfil, setPerfil] = useState(null)

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
      onFechar={onFechar}
      bloqueado={salvando}
      className="max-w-2xl"
    >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#E1E8DE] bg-[#F9FAF6] px-5 py-4">
          <div>
            <h2
              id="titulo-edicao-perfil"
              className="font-serif text-2xl leading-tight tracking-tight"
            >
              Meu perfil
            </h2>
            <p className="mt-0.5 text-xs text-[#6B7D71]">
              Conte um pouco sobre você e o que gosta de estudar.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar edição de perfil"
            className="rounded-lg p-1.5 text-[#53655C] transition-colors hover:bg-[#EEF2EA] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/25 disabled:opacity-50"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        {carregando ? (
          <div className="flex min-h-56 items-center justify-center">
            <Loader2
              aria-hidden="true"
              size={26}
              className="motion-safe:animate-spin text-[#2F6F4E]"
            />
            <span className="sr-only">Carregando perfil</span>
          </div>
        ) : !perfil ? (
          <div className="space-y-4 px-5 py-6">
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
          <form onSubmit={handleSalvar} className="space-y-5 px-5 py-5">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar
                nome={nome}
                fotoUrl={previewUrl ?? perfil.fotoUrl}
                tamanho="xl"
              />

              <div>
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
                  Trocar foto
                </label>
                <p className="mt-1.5 text-xs text-[#6B7D71]">
                  JPEG, PNG ou WebP, até 2 MB.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="perfil-nome" className={ROTULO}>
                Nome
              </label>
              <input
                id="perfil-nome"
                type="text"
                required
                maxLength={120}
                disabled={salvando}
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                className={CAMPO}
              />
            </div>

            <div>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <label htmlFor="perfil-bio" className={`${ROTULO} mb-0`}>
                  Biografia
                </label>
                <span className="text-xs text-[#6B7D71]">{bio.length}/500</span>
              </div>
              <textarea
                id="perfil-bio"
                rows={3}
                maxLength={500}
                disabled={salvando}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="O que você está estudando, seus objetivos..."
                className={`${CAMPO} resize-y`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="perfil-curso" className={ROTULO}>
                  Curso ou área
                </label>
                <input
                  id="perfil-curso"
                  type="text"
                  maxLength={120}
                  disabled={salvando}
                  value={cursoOuArea}
                  onChange={(event) => setCursoOuArea(event.target.value)}
                  placeholder="Ex.: Engenharia de Software"
                  className={CAMPO}
                />
              </div>

              <div>
                <label htmlFor="perfil-instituicao" className={ROTULO}>
                  Instituição
                </label>
                <input
                  id="perfil-instituicao"
                  type="text"
                  maxLength={150}
                  disabled={salvando}
                  value={instituicao}
                  onChange={(event) => setInstituicao(event.target.value)}
                  placeholder="Ex.: Universidade X"
                  className={CAMPO}
                />
              </div>
            </div>

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

            <FeedbackBanner tipo="erro" mensagem={erro} />

            <div className="flex flex-wrap justify-end gap-2 border-t border-[#E1E8DE] pt-4">
              <button
                type="button"
                onClick={onFechar}
                disabled={salvando}
                className={`${BOTAO_SECUNDARIO} px-4 py-2.5 text-sm`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                aria-busy={salvando}
                className={`${BOTAO_PRIMARIO} px-4 py-2.5 text-sm`}
              >
                {salvando && (
                  <Loader2
                    aria-hidden="true"
                    size={16}
                    className="motion-safe:animate-spin"
                  />
                )}
                {salvando ? 'Salvando...' : 'Salvar perfil'}
              </button>
            </div>
          </form>
        )}
    </Modal>
  )
}
