import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ProjectViewPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [fundingAgencyId, setFundingAgencyId] = useState('')
  const [agencies, setAgencies] = useState([])
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjectAndAgencies = async () => {
      try {
        const [projectRes, agenciesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/agencies`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        const p = projectRes.data
        setName(p.name)
        setCode(p.code)
        setDescription(p.description || '')
        setStatus(p.status || '')
        setStartDate(p.start_date?.split('T')[0] || '')
        setEndDate(p.end_date?.split('T')[0] || '')
        setBudget(p.budget || '')
        setFundingAgencyId(p.funding_agency_id || '')
        setAgencies(agenciesRes.data)
        setIsActive(p.is_active === 1)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar projeto ou agências.')
      }
    }

    fetchProjectAndAgencies()
  }, [id, token])

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Visualizar Projeto</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="max-w-xl space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Nome *</label>
          <input type="text" className="w-full p-2 border rounded bg-gray-100" value={name} readOnly />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Código *</label>
          <input type="text" className="w-full p-2 border rounded bg-gray-100" value={code} readOnly />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea className="w-full p-2 border rounded bg-gray-100" value={description} readOnly />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Status</label>
          <input type="text" className="w-full p-2 border rounded bg-gray-100" value={status} readOnly />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Data de Início *</label>
          <input type="date" className="w-full p-2 border rounded bg-gray-100" value={startDate} readOnly />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Data de Término *</label>
          <input type="date" className="w-full p-2 border rounded bg-gray-100" value={endDate} readOnly />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Orçamento Total (R$)</label>
          <input type="number" step="0.01" className="w-full p-2 border rounded bg-gray-100" value={budget} readOnly />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Agência de Fomento</label>
          <select
            className="w-full p-2 border rounded bg-gray-100"
            value={fundingAgencyId}
            disabled
          >
            <option value="">Nenhuma</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.cnpj} - {agency.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            disabled
          />
          <label className="text-gray-700">Projeto ativo</label>
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
