import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import SuccessModal from '../components/SuccessModal'
import ErrorModal from '../components/ErrorModal'

export default function ActivityTaskCreatePage() {
  const { id: activityId } = useParams()
  const navigate = useNavigate()

  const [activity, setActivity] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeSpent, setTimeSpent] = useState('')
  const [cost, setCost] = useState('')
  const [userId, setUserId] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorModalData, setErrorModalData] = useState({ isOpen: false, title: '', message: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activityRes, userRes] = await Promise.all([
          api.get(`/activities/${activityId}`),
          api.get(`/auth/me`)
        ])
        setActivity(activityRes.data)
        setUserId(userRes.data.id)
      } catch (err) {
        console.error(err)
        setErrorModalData({
          isOpen: true,
          title: 'Erro ao carregar dados iniciais',
          message: 'Tente novamente mais tarde.'
        })
      }
    }

    fetchData()
  }, [activityId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      activity_id: activityId,
      title,
      user_id: userId,
      ...(description && { description }),
      ...(timeSpent && { time_spent_minutes: Number(timeSpent) }),
      ...(cost && { cost: parseFloat(cost) })
    }

    try {
      await api.post(`/tasks`, payload)
      setShowSuccessModal(true)
    } catch (err) {
      console.error(err)
      const apiError = err.response?.data || {}
      setErrorModalData({
        isOpen: true,
        title: apiError.error || 'Erro ao criar tarefa',
        message: apiError.details || 'Tente novamente mais tarde.'
      })
    }
  }

  if (!activity) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Criar Tarefa</h2>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Atividade *</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-100"
            value={activity.name}
            disabled
          />
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
          <label className="block font-medium text-gray-700">Tempo Gasto (minutos)</label>
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
            Criar
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        title="Tarefa Criada!"
        message="A tarefa foi criada com sucesso."
        onClose={() => navigate(`/activities/${activityId}/tasks`)}
      />

      <ErrorModal
        isOpen={errorModalData.isOpen}
        title={errorModalData.title}
        message={errorModalData.message}
        onClose={() => setErrorModalData({ isOpen: false, title: '', message: '' })}
      />
    </div>
  )
}
