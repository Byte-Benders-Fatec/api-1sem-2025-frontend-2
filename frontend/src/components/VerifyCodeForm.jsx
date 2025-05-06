import { useState } from 'react'
import api from '../services/api'

const endpointMap = {
  login: '/auth/finalize-login',
  password_reset: '/auth/verify-reset',
  password_change: '/auth/verify-change',
  critical_action: '/auth/verify-action'
}

const tokenKeyMap = {
  login: 'twofa_login_token',
  password_reset: 'twofa_password_reset_token',
  password_change: 'twofa_password_change_token',
  critical_action: 'twofa_critical_action_token'
}

export default function VerifyCodeForm({ email, type, inputCode = '', onSuccessRedirect = '', onSuccess, onError }) {
  const [code, setCode] = useState(inputCode)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setError(null)

    try {
      const tokenKey = tokenKeyMap[type]
      const tokenValue = localStorage.getItem(tokenKey)

      const payload = {
        email,
        code,
        type,
        ...(tokenValue ? { [tokenKey]: tokenValue } : {})
      }

      const headers = {}
      if (type === 'login') {
        const loginToken = localStorage.getItem('login_token')
        headers.Authorization = `Bearer ${loginToken}`
      }

      const res = await api.post(endpointMap[type], payload, { headers })

      // Limpeza após sucesso
      localStorage.removeItem('login_token')
      Object.values(tokenKeyMap).forEach(key => localStorage.removeItem(key))

      if (type === 'login' && res.data.token) {
        localStorage.setItem('token', res.data.token)
      }

      if (onSuccess) {
        onSuccess(res.data)
      } else if (onSuccessRedirect) {
        window.location.href = onSuccessRedirect
      }
    } catch (err) {
      setError('Código inválido ou expirado.')
      if (onError) onError(err)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
        disabled={isVerifying}
        className={`w-full text-white p-2 rounded ${
          isVerifying ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isVerifying ? 'Verificando...' : 'Verificar Código'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  )
}
