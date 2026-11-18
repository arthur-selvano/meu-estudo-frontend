import { GraduationCap, LogOut } from 'lucide-react'
import Avatar from './Avatar'
import { BOTAO_SECUNDARIO } from '../styles/ui'

export default function DashboardHeader({ usuario, onSair, onAbrirPerfil }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#DCE3D8] bg-[#F4F6F0]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#12251D] text-[#F4F6F0]">
            <GraduationCap aria-hidden="true" size={18} strokeWidth={1.8} />
          </span>
          <span className="font-serif text-xl tracking-tight">MeuEstudos</span>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onAbrirPerfil}
            aria-label="Abrir meu perfil"
            className="flex min-w-0 items-center gap-2 rounded-lg py-1 pr-1 pl-1.5 text-sm text-[#53655C] transition-colors hover:bg-[#EEF2EA] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/25"
          >
            <Avatar
              nome={usuario.nome}
              fotoUrl={usuario.fotoUrl}
              tamanho="sm"
            />
            <span className="min-w-0 truncate">
              Olá,{' '}
              <span className="font-medium text-[#12251D]">
                {usuario.nome}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onSair}
            className={`${BOTAO_SECUNDARIO} shrink-0 px-3 py-2 text-sm`}
          >
            <LogOut aria-hidden="true" size={15} />
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
