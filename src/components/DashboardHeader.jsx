import { GraduationCap, LogOut } from 'lucide-react'

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
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#CBD6C8] px-3 py-2 text-sm font-medium text-[#173D2E] transition-colors hover:bg-[#EEF2EA] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/25"
          >
            <LogOut aria-hidden="true" size={15} />
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
