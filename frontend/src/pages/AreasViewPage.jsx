import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function AreasViewPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArea = async () => {
      try {
        const response = await api.get(`/areas/${id}`)
        setName(response.data.name)
        setDescription(response.data.description || '')
        setIsActive(response.data.is_active === 1)
      } catch (err) {
        setError('Erro ao carregar área.')
        console.error(err)
      }
    }

    fetchArea()
  }, [id])

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Visualizar Área</h2>

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
          <label className="text-gray-700">Área ativa</label>
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
