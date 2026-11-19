import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function BotaoTema({ className = '' }) {
  const { tema, alternarTema } = useTheme()
  const escuro = tema === 'escuro'
  const rotulo = escuro ? 'Ativar tema claro' : 'Ativar tema escuro'

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={rotulo}
      title={rotulo}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 ${className}`}
    >
      {escuro ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
    </button>
  )
}
