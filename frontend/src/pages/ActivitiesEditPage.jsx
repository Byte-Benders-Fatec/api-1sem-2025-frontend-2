import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ActivityEditPage() {

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
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activityRes, projectsRes] = await Promise.all([
          api.get(`/activities/${id}`),
          api.get(`/projects`)
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
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar dados da atividade.')
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const payload = {
      name,
      project_id: projectId,
      start_date: startDate,
      end_date: endDate,
      ...(description && { description }),
      ...(status && { status }),
      ...(allocatedBudget && { allocated_budget: allocatedBudget }),
      is_active: isActive ? 1 : 0
    }

    try {
      await api.put(`/activities/${id}`, payload)
      navigate('/activities')
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar atividade.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Editar Atividade</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Projeto *</label>
          <select
            className="w-full p-2 border rounded"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
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
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            <option value="">Selecione o status</option>
            <option value="Não iniciada">Não iniciada</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Orçamento da Atividade (R$)</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={allocatedBudget}
            onChange={(e) => setAllocatedBudget(e.target.value)}
          />
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

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label className="text-gray-700">Atividade ativa</label>
        </div>

        <div className="flex justify-between mt-6">

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
