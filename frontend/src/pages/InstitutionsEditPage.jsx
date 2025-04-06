import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatCNPJ } from '../utils/formatters'

export default function InstitutionsEditPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [acronym, setAcronym] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [website, setWebsite] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const res = await api.get(`/institutions/${id}`)
        const institution = res.data
        setName(institution.name)
        setAcronym(institution.acronym)
        setCnpj(institution.cnpj)
        setWebsite(institution.website || '')
        setIsActive(institution.is_active === 1)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar dados da instituição.')
      }
    }

    fetchInstitution()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const payload = {
      name,
      acronym,
      cnpj,
      ...(website && { website }),
      is_active: isActive ? 1 : 0
    }

    try {
      await api.put(`/institutions/${id}`, payload)
      navigate('/institutions')
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar instituição.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Editar Instituição</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Nome *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Sigla *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={acronym}
            onChange={(e) => setAcronym(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">CNPJ *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={cnpj}
            onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Site (opcional)</label>
          <input
            type="url"
            className="w-full p-2 border rounded"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label className="text-gray-700">Instituição ativa</label>
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
