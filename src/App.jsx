import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

function Conteudo() {
  const { usuario } = useAuth()

  return usuario ? <Dashboard /> : <AuthPage />
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Conteudo />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
