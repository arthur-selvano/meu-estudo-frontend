import { useState } from 'react'
import {
  AlertCircle,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CAMPO =
  'w-full rounded-lg border border-[#CBD6C8] bg-white py-3 pl-11 pr-4 text-[15px] text-[#12251D] placeholder:text-[#9AA79D] outline-none transition-colors focus:border-[#2F6F4E] focus:ring-[3px] focus:ring-[#2F6F4E]/15 disabled:cursor-not-allowed disabled:bg-[#F0F2EC]'
const ROTULO = 'mb-1.5 block text-sm font-medium text-[#33473C]'
const ICONE =
  'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9A8F]'

export default function AuthPage() {
  const { login, registrar } = useAuth()
  const [modo, setModo] = useState('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const cadastro = modo === 'cadastro'

  function alternarModo() {
    setModo(cadastro ? 'entrar' : 'cadastro')
    setErro('')
    setNome('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (carregando) return

    setErro('')
    setCarregando(true)

    try {
      if (cadastro) {
        await registrar({ nome, email, senha })
      } else {
        await login({ email, senha })
      }
    } catch (err) {
      setErro(
        err.response?.data?.erro ||
          'Não foi possível conectar ao servidor. Tente novamente.',
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F0] text-[#12251D] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#12251D] p-12 lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_47px,rgba(255,255,255,0.06)_47px,rgba(255,255,255,0.06)_48px)]"
        />

        <div className="relative flex items-center gap-3 text-[#E7EDE2]">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7EDE2]/25">
            <GraduationCap aria-hidden="true" size={20} strokeWidth={1.8} />
          </span>
          <span className="text-sm font-medium tracking-wide">MeuEstudos</span>
        </div>

        <div className="relative max-w-md">
          <p className="font-serif text-5xl leading-[1.05] tracking-tight text-[#F4F6F0]">
            Seus estudos, organizados.
          </p>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-[#C7D3C6]">
            Crie grupos, abra tópicos e convide colegas. Tudo em um só lugar,
            longe da bagunça.
          </p>
        </div>

        <p className="relative text-sm text-[#8FA392]">
          Um espaço para estudar com calma.
        </p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 lg:min-h-0">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#12251D] text-[#F4F6F0]">
              <GraduationCap aria-hidden="true" size={20} strokeWidth={1.8} />
            </span>
            <span className="font-serif text-xl tracking-tight">MeuEstudos</span>
          </div>

          <h1 className="font-serif text-4xl tracking-tight">
            {cadastro ? 'Criar conta' : 'Entrar'}
          </h1>
          <p className="mt-2 text-sm text-[#53655C]">
            {cadastro
              ? 'Comece a organizar seus estudos hoje.'
              : 'Continue de onde você parou.'}
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            {cadastro && (
              <div>
                <label htmlFor="nome" className={ROTULO}>
                  Nome completo
                </label>
                <div className="relative">
                  <User aria-hidden="true" size={18} className={ICONE} />
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    required
                    disabled={carregando}
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Como podemos chamar você?"
                    className={CAMPO}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className={ROTULO}>
                E-mail
              </label>
              <div className="relative">
                <Mail aria-hidden="true" size={18} className={ICONE} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={carregando}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@exemplo.com"
                  className={CAMPO}
                />
              </div>
            </div>

            <div>
              <label htmlFor="senha" className={ROTULO}>
                Senha
              </label>
              <div className="relative">
                <Lock aria-hidden="true" size={18} className={ICONE} />
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  autoComplete={cadastro ? 'new-password' : 'current-password'}
                  required
                  minLength={cadastro ? 8 : undefined}
                  disabled={carregando}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Sua senha"
                  className={CAMPO}
                />
              </div>
              {cadastro && (
                <p className="mt-1.5 text-xs text-[#6B7D71]">
                  Mínimo de 8 caracteres.
                </p>
              )}
            </div>

            {erro && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-[#E3C4B5] bg-[#FBEDE7] px-3.5 py-3 text-sm leading-snug text-[#8A3B1E]"
              >
                <AlertCircle
                  aria-hidden="true"
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{erro}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              aria-busy={carregando}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173D2E] px-4 py-3 text-[15px] font-semibold text-[#F4F6F0] transition-colors hover:bg-[#1F4D3A] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2F6F4E]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F6F0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando && (
                <Loader2
                  aria-hidden="true"
                  size={18}
                  className="motion-safe:animate-spin"
                />
              )}
              {carregando
                ? cadastro
                  ? 'Criando conta...'
                  : 'Entrando...'
                : cadastro
                  ? 'Criar conta'
                  : 'Entrar'}
            </button>
          </form>

          <p className="mt-7 text-sm text-[#53655C]">
            {cadastro ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
            <button
              type="button"
              onClick={alternarModo}
              className="rounded-sm font-semibold text-[#173D2E] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F4E]/40"
            >
              {cadastro ? 'Entrar' : 'Criar conta'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
