import { useState } from 'react'
import axios from 'axios'

export default function LoginPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password })
      localStorage.setItem('token', response.data.token)
      window.location.href = '/home'
    } catch (err) {
      setError('Credenciais inválidas')
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-green-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Login</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-3"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}
