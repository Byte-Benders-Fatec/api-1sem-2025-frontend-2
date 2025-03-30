import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

export default function TeamViewPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setName(response.data.name)
        setDescription(response.data.description || '')
        setIsActive(response.data.is_active === 1)
      } catch (err) {
        setError('Erro ao carregar time.')
        console.error(err)
      }
    }

    fetchTeam()
  }, [id, token])

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Visualizar Time</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="max-w-md space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Nome</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 bg-gray-100"
            value={name}
            readOnly
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2 bg-gray-100"
            value={description}
            readOnly
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            disabled
          />
          <label className="text-gray-700">Time ativo</label>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
