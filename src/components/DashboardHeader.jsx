import { GraduationCap, LogOut } from 'lucide-react'
import { BOTAO_SECUNDARIO } from '../styles/ui'

export default function DashboardHeader({ nome, onSair }) {
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
          <p className="min-w-0 truncate text-sm text-[#53655C]">
            Olá, <span className="font-medium text-[#12251D]">{nome}</span>
          </p>
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
