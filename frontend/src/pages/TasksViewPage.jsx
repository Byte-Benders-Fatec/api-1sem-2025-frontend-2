import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function TaskViewPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [activities, setActivities] = useState([])
  const [activityId, setActivityId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeSpent, setTimeSpent] = useState('')
  const [cost, setCost] = useState('')
  const [date, setDate] = useState('')
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
        setDate(task.date?.split('T')[0] || '')
        setActivities(activitiesRes.data)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar dados da tarefa.')
      }
    }

    fetchData()
  }, [id])

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Visualizar Tarefa</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="max-w-xl space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Atividade *</label>
          <select
            className="w-full p-2 border rounded bg-gray-100"
            value={activityId}
            disabled
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
            className="w-full p-2 border rounded bg-gray-100"
            value={title}
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
          <label className="block font-medium text-gray-700">Tempo gasto (minutos)</label>
          <input
            type="number"
            className="w-full p-2 border rounded bg-gray-100"
            value={timeSpent}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Custo (R$)</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border rounded bg-gray-100"
            value={cost}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Data *</label>
          <input
            type="date"
            className="w-full p-2 border rounded bg-gray-100"
            value={date}
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
