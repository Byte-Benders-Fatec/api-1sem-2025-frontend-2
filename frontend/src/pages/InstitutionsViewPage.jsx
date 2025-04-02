import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function InstitutionsViewPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [name, setName] = useState('')
  const [acronym, setAcronym] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [website, setWebsite] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/institutions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

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
  }, [id, token])

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Visualizar Instituição</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="max-w-xl space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Nome *</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-100"
            value={name}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Sigla *</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-100"
            value={acronym}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">CNPJ *</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-100"
            value={cnpj}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Site (opcional)</label>
          <input
            type="url"
            className="w-full p-2 border rounded bg-gray-100"
            value={website}
            readOnly
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            disabled
          />
          <label className="text-gray-700">Instituição ativa</label>
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
