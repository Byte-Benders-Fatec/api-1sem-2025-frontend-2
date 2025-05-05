import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuth from '../hooks/useAuth'
import ResetPasswordModal from '../components/ResetPasswordModal'

export default function LoginPage() {
  const { authenticated, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState(null)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (!loading && authenticated) {
      navigate('/home', { replace: true })
    }
  }, [loading, authenticated, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoggingIn(true)

    localStorage.removeItem('login_token')
    localStorage.removeItem('twofa_login_token')

    try {
      const res = await api.post(`/auth/login`, {
        email,
        password
      }, {
        private: false
      })

      const { code, login_token, twofa_login_token } = res.data

      setCode(code)
      setStep(2)

      localStorage.setItem('login_token', login_token)
      if (twofa_login_token) {
        localStorage.setItem('twofa_login_token', twofa_login_token)
      }
    } catch (err) {
      setError('Credenciais inválidas.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const loginToken = localStorage.getItem('login_token')
      const twofaLoginToken = localStorage.getItem('twofa_login_token')

      const payload = {
        email,
        code,
        type: 'login',
        ...(twofaLoginToken ? { twofa_login_token: twofaLoginToken } : {})
      }

      const res = await api.post(`/auth/finalize-login`, payload, {
        headers: {
          Authorization: `Bearer ${loginToken}`
        }
      })

      localStorage.removeItem('login_token')
      localStorage.removeItem('twofa_login_token')

      localStorage.setItem('token', res.data.token)

      alert('Login realizado com sucesso!');
      
      window.location.href = '/home'
    } catch (err) {
      setError('Código inválido ou expirado.')
    }
  }

  if (loading) {
    return <p className="text-center mt-8 text-gray-600">Verificando sessão...</p>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-4">Login</h2>

        {step === 1 && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="E-mail"
              className="w-full p-2 border border-gray-300 rounded mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Senha"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex justify-end mb-1">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="text-sm text-green-700 hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full text-white p-2 rounded ${
                isLoggingIn ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoggingIn ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-gray-700">Digite o código de verificação enviado por e-mail.</p>
            <input
              type="text"
              placeholder="Código OTP"
              className="w-full p-2 border border-gray-300 rounded text-center"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Verificar Código
            </button>
          </form>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  )
}
