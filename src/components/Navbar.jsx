import { useEffect, useRef, useState } from 'react'
import { ChevronDown, GraduationCap, LogOut, UserRound } from 'lucide-react'
import Avatar from './Avatar'
import BotaoTema from './BotaoTema'

const PAGINAS = [
  { valor: 'quadro', rotulo: 'Quadro' },
  { valor: 'comunidade', rotulo: 'Comunidade' },
  { valor: 'convite', rotulo: 'Convite' },
]

function Navegacao({ className, paginaAtiva, onNavegar }) {
  return (
    <nav
      aria-label="Navegação principal"
      className={`items-center gap-1 ${className}`}
    >
      {PAGINAS.map((pagina) => {
        const ativo = paginaAtiva === pagina.valor

        return (
          <button
            key={pagina.valor}
            type="button"
            onClick={() => onNavegar(pagina.valor)}
            aria-current={ativo ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 ${
              ativo
                ? 'bg-surface-hover text-ink'
                : 'text-ink-secondary hover:bg-surface-hover hover:text-ink'
            }`}
          >
            {pagina.rotulo}
          </button>
        )
      })}
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
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-line bg-surface p-1.5"
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
  paginaAtiva = 'quadro',
  carregando = false,
  onNavegar = () => {},
  onSair,
  onAbrirPerfil,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-page/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-14 items-center justify-between gap-3 md:min-h-16">
          <a href="#topo" className="inline-flex min-h-11 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-surface">
              <GraduationCap
                aria-hidden="true"
                size={18}
                strokeWidth={1.8}
              />
            </span>
            <span className="text-base font-semibold tracking-tight text-ink">
              Meu Estudo
            </span>
          </a>

          {!carregando && (
            <Navegacao
              className="hidden md:flex"
              paginaAtiva={paginaAtiva}
              onNavegar={onNavegar}
            />
          )}

          <div className="flex items-center gap-1.5">
            <BotaoTema />

            <MenuUsuario
              usuario={usuario}
              onSair={onSair}
              onAbrirPerfil={onAbrirPerfil}
            />
          </div>
        </div>

        {!carregando && (
          <div className="flex justify-center border-t border-line-faint py-1.5 md:hidden">
            <Navegacao
              className="flex"
              paginaAtiva={paginaAtiva}
              onNavegar={onNavegar}
            />
          </div>
        )}
      </div>
    </header>
  )
}
