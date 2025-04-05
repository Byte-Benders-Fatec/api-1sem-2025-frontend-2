import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function AgencyViewPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [acronym, setAcronym] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [website, setWebsite] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const res = await api.get(`/agencies/${id}`)
        const agency = res.data
        setName(agency.name)
        setAcronym(agency.acronym)
        setCnpj(agency.cnpj)
        setWebsite(agency.website || '')
        setIsActive(agency.is_active === 1)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar dados da agência.')
      }
    }

    fetchAgency()
  }, [id])

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Visualizar Agência Financiadora</h2>
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
          <label className="text-gray-700">Agência ativa</label>
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
