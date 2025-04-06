import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function TaskEditPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [activities, setActivities] = useState([])
  const [activityId, setActivityId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeSpent, setTimeSpent] = useState('')
  const [cost, setCost] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, activitiesRes] = await Promise.all([
          api.get(`/tasks/${id}`),
          api.get(`/activities`)
        ])

        const task = taskRes.data
        setActivityId(task.activity_id)
        setTitle(task.title)
        setDescription(task.description || '')
        setTimeSpent(task.time_spent_minutes || '')
        setCost(task.cost || '')
        setActivities(activitiesRes.data)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar dados da tarefa.')
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const payload = {
      activity_id: activityId,
      title,
      description,
      time_spent_minutes: timeSpent || 0,
      cost: cost || 0
    }

    try {
      await api.put(`/tasks/${id}`, payload)
      navigate('/tasks')
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar tarefa.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Editar Tarefa</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Atividade *</label>
          <select
            className="w-full p-2 border rounded"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            required
          >
            <option value="">Selecione uma atividade</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Título *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          <label className="block font-medium text-gray-700">Tempo gasto (minutos)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
            min="0"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Custo (R$)</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            min="0"
          />
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
