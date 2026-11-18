import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

function Conteudo() {
  const { usuario } = useAuth()

  return usuario ? <Dashboard /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Conteudo />
    </AuthProvider>
  )
}
