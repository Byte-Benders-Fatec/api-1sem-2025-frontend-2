import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function UserEditPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`)
        setName(response.data.name)
        setEmail(response.data.email)
        setIsActive(response.data.is_active === 1)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar usuário.')
      }
    }

    fetchUser()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password && password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    const payload = {
      name,
      email,
      is_active: isActive ? 1 : 0
    }

    if (password) {
      payload.password = password
    }

    try {
      await api.put(`/users/${id}`, payload)
      navigate('/users')
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar usuário.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Editar Usuário</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Nome</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Nova Senha (opcional)</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Confirmar Nova Senha</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded p-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label className="text-gray-700">Usuário ativo</label>
        </div>

        <div className="flex space-x-12 mt-6">

            <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
                ← Voltar
            </button>

            <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                Salvar Alterações
            </button>

        </div>

      </form>
    </div>
  )
}
