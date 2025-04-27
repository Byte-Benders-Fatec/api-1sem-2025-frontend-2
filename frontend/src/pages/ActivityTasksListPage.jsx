import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'
import PublicProfileModal from '../components/PublicProfileModal'
import { formatDateBR } from '../utils/formatDate'

export default function ActivityTasksListPage() {
  const { id: activityId } = useParams()
  const navigate = useNavigate()

  const [activity, setActivity] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const [spentBudget, setSpentBudget] = useState(0)
  const [totalTimeSpent, setTotalTimeSpent] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState(null)

  const fetchActivityAndTasks = async () => {
    try {
      const [activityRes, tasksRes] = await Promise.all([
        api.get(`/activities/${activityId}`),
        api.get(`/activities/${activityId}/tasks`)
      ])
      const activityData = activityRes.data
      const tasksData = await Promise.all(
        tasksRes.data.map(async (task) => {
          if (task.user_id) {
            try {
              const userRes = await api.get(`/users/${task.user_id}`)
              return { ...task, userName: userRes.data.name, userId: task.user_id }
            } catch (err) {
              console.error('Erro ao buscar usuário da tarefa')
              return { ...task, userName: 'Usuário não encontrado' }
            }
          } else {
            return { ...task, userName: '—' }
          }
        })
      )

      setActivity(activityData)
      setTasks(tasksData)
      filterAndSearch(tasksData, search)

      const totalSpent = tasksData.reduce(
        (sum, task) => sum + (parseFloat(task.cost || 0)),
        0
      )
      setSpentBudget(parseFloat(totalSpent.toFixed(2)))

      const totalTime = tasksData.reduce(
        (sum, task) => sum + (parseInt(task.time_spent_minutes || 0)),
        0
      )
      setTotalTimeSpent(totalTime)

    } catch (err) {
      console.error(err)
      setError('Erro ao carregar atividade ou tarefas.')
    }
  }

  useEffect(() => {
    fetchActivityAndTasks()
  }, [activityId])

  const filterAndSearch = (tasksList, searchText) => {
    const lowerText = searchText.toLowerCase()
    const results = tasksList.filter((t) =>
      t.title.toLowerCase().includes(lowerText) ||
      (t.userName && t.userName.toLowerCase().includes(lowerText))
    )
    setFiltered(results)
  }

  const handleSearch = (text) => {
    setSearch(text)
    filterAndSearch(tasks, text)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'tasks',
    onSuccess: fetchActivityAndTasks
  })

  if (!activity) {
    return <div>Carregando...</div>
  }

  const availableBudget = (parseFloat(activity.allocated_budget || 0) - spentBudget).toFixed(2)

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

      <h2 className="text-xl font-bold text-green-700 mb-2">Atividade</h2>
      <div className="mb-6 space-y-1">
        <p><strong>Nome:</strong> {activity.name}</p>
        <p><strong>Descrição:</strong> {activity.description || '—'}</p>
        <p><strong>Status:</strong> {activity.status || '—'}</p>
        <p><strong>Data de Início:</strong> {formatDateBR(activity.start_date)}</p>
        <p><strong>Data de Término:</strong> {formatDateBR(activity.end_date)}</p>
        <p><strong>Orçamento Alocado:</strong> {activity.allocated_budget
          ? `R$ ${parseFloat(activity.allocated_budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : '—'}</p>
        <p><strong>Valor Gasto Total:</strong> {`R$ ${spentBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</p>
        <p><strong>Valor Disponível:</strong> {`R$ ${parseFloat(availableBudget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</p>
        <p><strong>Tempo Gasto Total:</strong> {`${totalTimeSpent} minutos`}</p>
      </div>

      <h2 className="text-xl font-bold text-green-700 mb-2">Tarefas:</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por título ou autor"
        className="border border-gray-300 rounded p-2 mb-4 w-full max-w-md"
      />

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="w-full border bg-white rounded shadow-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left p-2 border-b">Título</th>
            <th className="text-left p-2 border-b">Registrado por</th>
            <th className="text-left p-2 border-b">Tempo (min)</th>
            <th className="text-left p-2 border-b">Custo</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((task) => (
            <tr key={task.id}>
              <td className="p-2 border-b">{task.title}</td>
              <td className="p-2 border-b">
                {task.userId ? (
                  <button
                    onClick={() => setSelectedUserId(task.userId)}
                    className="text-green-700 hover:underline"
                  >
                    {task.userName}
                  </button>
                ) : (
                  '—'
                )}
              </td>
              <td className="p-2 border-b">{task.time_spent_minutes ?? 0}</td>
              <td className="p-2 border-b">
                R$ {parseFloat(task.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

      <PublicProfileModal
        isOpen={!!selectedUserId}
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  )
}
