import { useState } from 'react'
import axios from 'axios'

export default function LoginPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1) // 1 = login, 2 = código 2FA
  const [loginToken, setLoginToken] = useState(null)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      })

      // resposta: { message, code, login_token }
      const { code, login_token } = res.data

      setCode(code)
      setLoginToken(login_token)
      setStep(2)
    } catch (err) {
      setError('Credenciais inválidas.')
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/verify-code`,
        { email, code },
        {
          headers: {
            Authorization: `Bearer ${loginToken}`
          }
        }
      )

      localStorage.setItem('token', res.data.token)
      window.location.href = '/home'
    } catch (err) {
      setError('Código inválido ou expirado.')
    }
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
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Entrar
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <p className="text-gray-700">Digite o código de verificação enviado por e-mail.</p>
          <input
            type="text"
            placeholder="Código 2FA"
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

      {error && <p className="text-red-500 mb-2">{error}</p>}
    </div>
    </div>
  )
}
