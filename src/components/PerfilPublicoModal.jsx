import { useEffect, useState } from 'react'
import { CalendarDays, Loader2, X } from 'lucide-react'
import Avatar from './Avatar'
import FeedbackBanner from './FeedbackBanner'
import Modal from './Modal'
import { mensagemDeErro } from '../services/api'
import { obterPerfilPublico } from '../services/perfilService'
import { BOTAO_SECUNDARIO } from '../styles/ui'

function formatarMesAno(valor) {
  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(data)
}

function GrupoTopicos({ titulo, topicos, vazio }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-[#33473C]">{titulo}</h3>

      {topicos.length === 0 ? (
        <p className="mt-1.5 text-sm text-[#6B7D71]">{vazio}</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {topicos.map((topico) => (
            <li
              key={topico}
              className="max-w-full break-words rounded-full border border-[#CBD6C8] bg-[#F0F4EC] px-2.5 py-1 text-xs text-[#33473C]"
            >
              {topico}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function PerfilPublicoModal({ usuarioId, onFechar }) {
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true

    obterPerfilPublico(usuarioId)
      .then((dados) => {
        if (!ativo) return
        setPerfil(dados)
        setCarregando(false)
      })
      .catch((err) => {
        if (!ativo) return
        setErro(
          mensagemDeErro(err, 'Não foi possível carregar este perfil.'),
        )
        setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [usuarioId, tentativa])

  function tentarNovamente() {
    setCarregando(true)
    setErro('')
    setTentativa((valor) => valor + 1)
  }

  return (
    <Modal
      labelledBy={perfil ? 'titulo-perfil-publico' : undefined}
      label={perfil ? undefined : 'Perfil público'}
      onFechar={onFechar}
      className="max-w-lg"
    >
        <div className="flex items-center justify-between gap-3 border-b border-[#E1E8DE] px-4 py-3 sm:px-5">
          <p className="text-xs font-medium tracking-wide text-[#6B7D71] uppercase">
            Perfil
          </p>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar perfil"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-1.5 text-[#53655C] transition-colors hover:bg-[#EEF2EA] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/25"
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
        ) : erro ? (
          <div className="space-y-3 px-4 py-6 sm:px-5">
            <FeedbackBanner tipo="erro" mensagem={erro} />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={tentarNovamente}
                className={`${BOTAO_SECUNDARIO} px-3.5 py-2 text-sm`}
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={onFechar}
                className={`${BOTAO_SECUNDARIO} px-3.5 py-2 text-sm`}
              >
                Fechar
              </button>
            </div>
          </div>
        ) : perfil ? (
          <div className="space-y-5 px-4 py-5 sm:px-5">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar
                nome={perfil.nome}
                fotoUrl={perfil.fotoUrl}
                tamanho="xl"
              />

              <div className="min-w-0">
                <h2
                  id="titulo-perfil-publico"
                  className="break-words font-serif text-2xl leading-tight tracking-tight text-[#12251D]"
                >
                  {perfil.nome}
                </h2>

                {(perfil.cursoOuArea || perfil.instituicao) && (
                  <p className="mt-1 break-words text-sm text-[#53655C]">
                    {[perfil.cursoOuArea, perfil.instituicao]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}

                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#6B7D71]">
                  <CalendarDays aria-hidden="true" size={13} />
                  Membro desde {formatarMesAno(perfil.criadoEm)}
                </p>
              </div>
            </div>

            <section>
              <h3 className="text-sm font-semibold text-[#33473C]">
                Sobre
              </h3>
              <p className="mt-1.5 break-words text-sm leading-relaxed text-[#53655C]">
                {perfil.bio || 'Ainda não escreveu uma biografia.'}
              </p>
            </section>

            <GrupoTopicos
              titulo="Quer estudar"
              topicos={perfil.topicosInteresse ?? []}
              vazio="Ainda não informou."
            />

            <GrupoTopicos
              titulo="Pode ajudar em"
              topicos={perfil.topicosAjuda ?? []}
              vazio="Ainda não informou."
            />
          </div>
        ) : null}
    </Modal>
  )
}
