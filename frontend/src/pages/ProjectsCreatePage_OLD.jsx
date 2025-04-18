import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ProjectCreatePage() {

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Planejado')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [fundingAgencyId, setFundingAgencyId] = useState('')
  const [createdById, setCreatedById] = useState('')
  const [agencies, setAgencies] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserAndAgencies = async () => {
      try {
        const [userRes, agenciesRes] = await Promise.all([
          api.get(`/auth/me`),
          api.get(`/agencies`)
        ])
        setCreatedById(userRes.data.id)
        setAgencies(agenciesRes.data)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar usuário ou agências.')
      }
    }

    fetchUserAndAgencies()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const payload = {
      name,
      code,
      start_date: startDate,
      end_date: endDate,
      ...(description && { description }),
      ...(status && { status }),
      ...(budget && { budget }),
      ...(fundingAgencyId && { funding_agency_id: fundingAgencyId }),
      created_by_id: createdById
    }

    try {
      await api.post(`/projects`, payload)
      navigate('/projects')
    } catch (err) {
      console.error(err)
      setError('Erro ao criar projeto.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Criar Projeto</h2>

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
          <label className="block font-medium text-gray-700">Código *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Status</label>
          <select
            className="w-full p-2 border rounded"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Planejado">Planejado</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Suspenso">Suspenso</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Data de Início *</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Data de Término *</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Orçamento Total (R$)</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Agência de Fomento</label>
          <select
            className="w-full p-2 border rounded"
            value={fundingAgencyId}
            onChange={(e) => setFundingAgencyId(e.target.value)}
          >
            <option value="">Selecione uma agência (opcional)</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.cnpj} - {agency.name}
              </option>
            ))}
          </select>
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
    </div>
  )
}
