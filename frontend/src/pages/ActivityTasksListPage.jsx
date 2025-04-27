import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'

export default function ActivityTasksListPage() {
  const { id: activityId } = useParams()
  const navigate = useNavigate()

  const [activity, setActivity] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)

  const fetchActivityAndTasks = async () => {
    try {
      const [activityRes, tasksRes] = await Promise.all([
        api.get(`/activities/${activityId}`),
        api.get(`/activities/${activityId}/tasks`)
      ])
      setActivity(activityRes.data)
      setTasks(tasksRes.data)
      setFiltered(tasksRes.data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar informações da atividade ou tarefas.')
    }
  }

  useEffect(() => {
    fetchActivityAndTasks()
  }, [activityId])

  const handleSearch = (text) => {
    setSearch(text)
    const lowerText = text.toLowerCase()
    const results = tasks.filter(t =>
      t.title.toLowerCase().includes(lowerText)
    )
    setFiltered(results)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'tasks',
    onSuccess: fetchActivityAndTasks
  })

  if (!activity) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ← Voltar
        </button>

        <Link
          to={`/activities/${activityId}/tasks/create`}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Criar Nova Tarefa
        </Link>
      </div>

      <h2 className="text-xl font-bold text-green-700 mb-2">Tarefas da Atividade</h2>
      <div className="mb-6 space-y-1">
        <p><strong>Nome:</strong> {activity.name}</p>
        <p><strong>Descrição:</strong> {activity.description || '—'}</p>
        <p><strong>Status:</strong> {activity.status || '—'}</p>
        <p><strong>Orçamento Alocado:</strong> {activity.allocated_budget
          ? `R$ ${parseFloat(activity.allocated_budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : '—'}</p>
        <p><strong>Data de Início:</strong> {activity.start_date?.split('T')[0] || '—'}</p>
        <p><strong>Data de Término:</strong> {activity.end_date?.split('T')[0] || '—'}</p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por título"
        className="border border-gray-300 rounded p-2 mb-4 w-full max-w-md"
      />

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="w-full border bg-white rounded shadow-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left p-2 border-b">Título</th>
            <th className="text-left p-2 border-b">Tempo (min)</th>
            <th className="text-left p-2 border-b">Custo</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((task) => (
            <tr key={task.id}>
              <td className="p-2 border-b">{task.title}</td>
              <td className="p-2 border-b">{task.time_spent_minutes ?? 0}</td>
              <td className="p-2 border-b">
                R$ {parseFloat(task.cost || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
              </td>
              <td className="p-2 border-b space-x-2">
                <Link
                  to={`/tasks/${task.id}/view`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Visualizar
                </Link>
                <Link
                  to={`/tasks/${task.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                <button
                  onClick={() => openConfirmModal(task.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta tarefa?"
        onConfirm={handleDelete}
        onCancel={closeConfirmModal}
      />
    </div>
  )
}
