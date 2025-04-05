import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function AreasEditPage() {

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      await api.put(
        `/areas/${id}`,
        { name, description, is_active: isActive ? 1 : 0 }
      )
      navigate('/areas')
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar área.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Editar Área</h2>

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
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label className="text-gray-700">Área ativa</label>
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
