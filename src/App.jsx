import { LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'

function iniciaisDe(nome) {
  if (typeof nome !== 'string') return ''

  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

function Conteudo() {
  const { usuario, logout } = useAuth()

  if (!usuario) {
    return <AuthPage />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F6F0] px-5 py-10 text-[#12251D]">
      <section className="w-full max-w-md rounded-xl border border-[#CBD6C8] bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCE8D8] font-serif text-lg font-semibold text-[#173D2E]">
            {iniciaisDe(usuario.nome)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-serif text-xl leading-tight">
              {usuario.nome}
            </p>
            <p className="truncate text-sm text-[#53655C]">{usuario.email}</p>
          </div>
        </div>

        <p className="mt-6 border-t border-[#E1E8DE] pt-6 text-sm text-[#53655C]">
          Sessão ativa. A tela principal do MeuEstudos entra aqui.
        </p>

        <button
          type="button"
          onClick={logout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#CBD6C8] px-4 py-2.5 text-sm font-semibold text-[#173D2E] transition-colors hover:bg-[#EEF2EA] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/25"
        >
          <LogOut aria-hidden="true" size={16} />
          Sair
        </button>
      </section>
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Conteudo />
    </AuthProvider>
  )
}
