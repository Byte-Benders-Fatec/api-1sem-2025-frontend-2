import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ActivityViewPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [allocatedBudget, setAllocatedBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [createdBy, setCreatedBy] = useState('')
  const [availableUsers, setAvailableUsers] = useState([])
  const [activityUsers, setActivityUsers] = useState([])
  const [responsibleUser, setResponsibleUser] = useState(null)

  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activityRes, projectsRes, meRes] = await Promise.all([
          api.get(`/activities/${id}`),
          api.get(`/projects`),
          api.get(`/auth/me`)
        ])

        const a = activityRes.data
        setName(a.name)
        setDescription(a.description || '')
        setStatus(a.status || '')
        setAllocatedBudget(a.allocated_budget || '')
        setStartDate(a.start_date?.split('T')[0] || '')
        setEndDate(a.end_date?.split('T')[0] || '')
        setProjectId(a.project_id)
        setProjects(projectsRes.data)
        setIsActive(a.is_active === 1)
        setCreatedBy(meRes.data)

        const [usersRes, availableUsersRes] = await Promise.all([
          api.get(`/activities/${id}/users`),
          api.get(`/activities/${id}/available-users`)
        ])
        setActivityUsers(usersRes.data)
        setAvailableUsers(availableUsersRes.data)

        if (a.responsible_user_id) {
          const respUser = [...usersRes.data, meRes.data].find(u => u.id === a.responsible_user_id)
          if (respUser) {
            setResponsibleUser(`${respUser.name} (${respUser.email})`)
          }
        }
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar dados da atividade.')
      }
    }

    fetchData()
  }, [id])

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Visualizar Atividade</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="max-w-xl space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Projeto *</label>
          <select
            className="w-full p-2 border rounded bg-gray-100"
            value={projectId}
            disabled
          >
            <option value="">Selecione um projeto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

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
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea
            className="w-full p-2 border rounded bg-gray-100"
            value={description}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Status</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-100"
            value={status}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Orçamento da Atividade (R$)</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border rounded bg-gray-100"
            value={allocatedBudget}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Data de Início *</label>
          <input
            type="date"
            className="w-full p-2 border rounded bg-gray-100"
            value={startDate}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Data de Término *</label>
          <input
            type="date"
            className="w-full p-2 border rounded bg-gray-100"
            value={endDate}
            readOnly
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            disabled
          />
          <label className="text-gray-700">Atividade ativa</label>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">
            Integrantes da Atividade ({activityUsers.length}/{activityUsers.length + availableUsers.length})
          </h3>

          <div className="mt-2 max-h-48 overflow-y-auto border rounded">
            <ul>
              {activityUsers.map(user => (
                <li key={user.id} className="flex justify-between items-center border-b py-1 px-2">
                  <span>{user.name} ({user.email})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <label className="block font-semibold text-gray-700 mb-2">Responsável pela Atividade *</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-100"
            value={responsibleUser || 'Não definido'}
            readOnly
          />
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
