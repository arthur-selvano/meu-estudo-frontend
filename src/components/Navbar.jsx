import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  GraduationCap,
  LogOut,
  Plus,
  UserRound,
} from 'lucide-react'
import Avatar from './Avatar'
import BotaoTema from './BotaoTema'
import { BOTAO_PRIMARIO } from '../styles/ui'

function LinkSecao({ secao, rotulo, ativo, pendentes, onIrParaSecao }) {
  function handleClick() {
    onIrParaSecao(secao)
    requestAnimationFrame(() =>
      document.getElementById(secao)?.focus({ preventScroll: true }),
    )
  }

  return (
    <a
      href={`#${secao}`}
      onClick={handleClick}
      aria-current={ativo ? 'true' : undefined}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 ${
        ativo
          ? 'bg-accent-soft text-accent-ink'
          : 'text-ink-secondary hover:bg-surface-hover hover:text-ink'
      }`}
    >
      {rotulo}
      {secao === 'convites' && pendentes > 0 && (
        <>
          <span
            aria-hidden="true"
            className="rounded-full bg-surface-soft px-1.5 text-[11px] font-semibold text-ink-muted"
          >
            {pendentes}
          </span>
          <span className="sr-only">, {pendentes} pendentes</span>
        </>
      )}
    </a>
  )
}

function Navegacao({
  className,
  secaoAtiva,
  convitesPendentes,
  onIrParaSecao,
}) {
  return (
    <nav
      aria-label="Navegação principal"
      className={`items-center gap-1 ${className}`}
    >
      <LinkSecao
        secao="quadros"
        rotulo="Quadros"
        ativo={secaoAtiva === 'quadros'}
        pendentes={convitesPendentes}
        onIrParaSecao={onIrParaSecao}
      />
      <LinkSecao
        secao="comunidade"
        rotulo="Comunidade"
        ativo={secaoAtiva === 'comunidade'}
        onIrParaSecao={onIrParaSecao}
      />
      <LinkSecao
        secao="convites"
        rotulo="Convites"
        ativo={secaoAtiva === 'convites'}
        pendentes={convitesPendentes}
        onIrParaSecao={onIrParaSecao}
      />
    </nav>
  )
}

function MenuUsuario({ usuario, onSair, onAbrirPerfil }) {
  const [aberto, setAberto] = useState(false)
  const gatilhoRef = useRef(null)
  const painelRef = useRef(null)

  useEffect(() => {
    if (!aberto) return undefined

    painelRef.current?.querySelector('button')?.focus()

    function aoApontar(event) {
      const dentroDoPainel = painelRef.current?.contains(event.target)
      const noGatilho = gatilhoRef.current?.contains(event.target)

      if (!dentroDoPainel && !noGatilho) setAberto(false)
    }

    document.addEventListener('pointerdown', aoApontar)
    return () => document.removeEventListener('pointerdown', aoApontar)
  }, [aberto])

  function fechar(devolverFoco = false) {
    setAberto(false)
    if (devolverFoco) gatilhoRef.current?.focus()
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      fechar(true)
    }
  }

  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setAberto(false)
  }

  return (
    <div className="relative" onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <button
        ref={gatilhoRef}
        type="button"
        aria-expanded={aberto}
        aria-controls="menu-usuario"
        aria-label="Abrir menu do usuário"
        onClick={() => setAberto((valor) => !valor)}
        className="flex min-h-11 min-w-11 items-center gap-1 rounded-lg px-1 text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25"
      >
        <Avatar
          nome={usuario.nome}
          fotoUrl={usuario.fotoUrl}
          tamanho="sm"
        />
        <ChevronDown aria-hidden="true" size={15} />
      </button>

      {aberto && (
        <div
          ref={painelRef}
          id="menu-usuario"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-lg"
        >
          <div className="mb-1 border-b border-line-faint px-2.5 py-2">
            <p className="truncate text-sm font-medium text-ink">
              {usuario.nome}
            </p>
            <p className="truncate text-xs text-ink-muted">{usuario.email}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              fechar()
              onAbrirPerfil()
            }}
            className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm text-ink-soft transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25"
          >
            <UserRound aria-hidden="true" size={16} />
            Meu perfil
          </button>

          <button
            type="button"
            onClick={() => {
              fechar()
              onSair()
            }}
            className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm text-danger-ink transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25"
          >
            <LogOut aria-hidden="true" size={16} />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar({
  usuario,
  convitesPendentes = 0,
  secaoAtiva = null,
  carregando = false,
  onIrParaSecao = () => {},
  onNovoQuadro = () => {},
  onSair,
  onAbrirPerfil,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-page/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-14 items-center justify-between gap-3 md:min-h-16">
          <a href="#topo" className="inline-flex min-h-11 items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary">
              <GraduationCap
                aria-hidden="true"
                size={18}
                strokeWidth={1.8}
              />
            </span>
            <span className="font-serif text-xl tracking-tight text-ink">
              Meu Estudo
            </span>
          </a>

          {!carregando && (
            <Navegacao
              className="hidden md:flex"
              secaoAtiva={secaoAtiva}
              convitesPendentes={convitesPendentes}
              onIrParaSecao={onIrParaSecao}
            />
          )}

          <div className="flex items-center gap-1.5">
            {!carregando && (
              <button
                type="button"
                onClick={onNovoQuadro}
                className={`${BOTAO_PRIMARIO} hidden min-h-11 px-3 py-2 text-sm md:inline-flex`}
              >
                <Plus aria-hidden="true" size={16} />
                Novo quadro
              </button>
            )}

            <BotaoTema />

            <MenuUsuario
              usuario={usuario}
              onSair={onSair}
              onAbrirPerfil={onAbrirPerfil}
            />
          </div>
        </div>

        {!carregando && (
          <div className="flex items-center justify-between gap-2 border-t border-line-faint py-1.5 md:hidden">
            <Navegacao
              className="flex"
              secaoAtiva={secaoAtiva}
              convitesPendentes={convitesPendentes}
              onIrParaSecao={onIrParaSecao}
            />

            <button
              type="button"
              onClick={onNovoQuadro}
              aria-label="Novo quadro"
              className={`${BOTAO_PRIMARIO} min-h-11 min-w-11 px-2 py-2`}
            >
              <Plus aria-hidden="true" size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
