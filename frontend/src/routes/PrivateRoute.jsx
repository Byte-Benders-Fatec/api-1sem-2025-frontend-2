import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function PrivateRoute({ children }) {
  const { authenticated, loading } = useAuth()

  if (loading) {
    return <p className="text-center mt-8 text-gray-600">Verificando acesso...</p>
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
