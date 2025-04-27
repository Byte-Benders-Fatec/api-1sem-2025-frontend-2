import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ProjectViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [areas, setAreas] = useState([])
  const [teams, setTeams] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [agencies, setAgencies] = useState([])
  const [fundingAgencies, setFundingAgencies] = useState([])
  const [responsibleUser, setResponsibleUser] = useState(null)

  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          projectRes,
          areasRes,
          teamsRes,
          institutionsRes,
          fundingAgenciesRes,
          usersRes
        ] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/areas`),
          api.get(`/projects/${id}/teams`),
          api.get(`/projects/${id}/institutions`),
          api.get(`/projects/${id}/agencies`),
          api.get(`/projects/${id}/users`)
        ])

        const p = projectRes.data
        setName(p.name)
        setCode(p.code)
        setDescription(p.description || '')
        setStatus(p.status || '')
        setStartDate(p.start_date?.split('T')[0] || '')
        setEndDate(p.end_date?.split('T')[0] || '')
        setBudget(p.budget || '')
        setIsActive(p.is_active === 1)
        setFundingAgencies(fundingAgenciesRes.data)

        setAreas(areasRes.data || [])
        setTeams(teamsRes.data || [])
        setInstitutions(institutionsRes.data || [])

        const responsible = usersRes.data.find(user => user.id === p.responsible_user_id)
        setResponsibleUser(responsible || null)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar dados do projeto.')
      }
    }

    fetchData()
  }, [id])

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Visualizar Projeto</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="max-w-4xl space-y-6">

        {/* DADOS PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700">Nome *</label>
            <input type="text" className="w-full p-2 border rounded bg-gray-100" value={name} readOnly />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Código *</label>
            <input type="text" className="w-full p-2 border rounded bg-gray-100" value={code} readOnly />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-gray-700">Descrição</label>
            <textarea className="w-full p-2 border rounded bg-gray-100" value={description} readOnly />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Status</label>
            <input type="text" className="w-full p-2 border rounded bg-gray-100" value={status} readOnly />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Orçamento Total (R$)</label>
            <input type="number" step="0.01" className="w-full p-2 border rounded bg-gray-100" value={budget} readOnly />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Data de Início *</label>
            <input type="date" className="w-full p-2 border rounded bg-gray-100" value={startDate} readOnly />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Data de Término *</label>
            <input type="date" className="w-full p-2 border rounded bg-gray-100" value={endDate} readOnly />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isActive}
              disabled
            />
            <label className="text-gray-700">Projeto ativo</label>
          </div>
        </div>

        {/* ÁREAS VINCULADAS */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Áreas Vinculadas</label>
          <ul className="list-disc list-inside bg-gray-100 p-4 rounded">
            {areas.length > 0 ? areas.map(area => (
              <li key={area.id}>{area.name}</li>
            )) : <li>Nenhuma área vinculada.</li>}
          </ul>
        </div>

        {/* TIMES VINCULADOS */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Times Vinculados</label>
          <ul className="list-disc list-inside bg-gray-100 p-4 rounded">
            {teams.length > 0 ? teams.map(team => (
              <li key={team.id}>{team.name}</li>
            )) : <li>Nenhum time vinculado.</li>}
          </ul>
        </div>

        {/* INSTITUIÇÕES VINCULADAS */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Instituições Vinculadas</label>
          <ul className="list-disc list-inside bg-gray-100 p-4 rounded">
            {institutions.length > 0 ? institutions.map(inst => (
              <li key={inst.id}>{inst.name}</li>
            )) : <li>Nenhuma instituição vinculada.</li>}
          </ul>
        </div>

        {/* AGÊNCIAS DE FOMENTO VINCULADAS */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Agências de Fomento Vinculadas</label>
          <ul className="list-disc list-inside bg-gray-100 p-4 rounded">
            {fundingAgencies.length > 0 ? fundingAgencies.map(agency => (
              <li key={agency.id}>{agency.name} ({agency.cnpj})</li>
            )) : <li>Nenhuma agência vinculada.</li>}
          </ul>
        </div>

        {/* RESPONSÁVEL PELO PROJETO */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Responsável pelo Projeto</label>
          <div className="bg-gray-100 p-4 rounded">
            {responsibleUser ? (
              <p>{responsibleUser.name} ({responsibleUser.email})</p>
            ) : (
              <p>Nenhum responsável definido.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-8">
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
