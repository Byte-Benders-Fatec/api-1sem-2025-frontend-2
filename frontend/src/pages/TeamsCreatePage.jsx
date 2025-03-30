import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function TeamsCreatePage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_BASE_URL}/teams`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setSuccess(true)
      setName('')
      setDescription('')
    } catch (err) {
      setError('Erro ao criar time.')
      console.error(err)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Criar Time</h2>

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
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
                Criar
            </button>

        </div>

      </form>

      {success && <p className="text-green-600 mt-4">Time criado com sucesso!</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  )
}
