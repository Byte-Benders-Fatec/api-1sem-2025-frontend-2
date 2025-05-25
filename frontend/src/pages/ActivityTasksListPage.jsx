import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'
import PublicProfileModal from '../components/PublicProfileModal'
import { formatDateBR } from '../utils/formatDate'
import { IsUserAdmin } from '../utils/cookie'

export default function ActivityTasksListPage() {
  const { id: activityId } = useParams()
  const navigate = useNavigate()

  const [activity, setActivity] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [error, setError] = useState(null)
  const [responsibleUserName, setResponsibleUserName] = useState('')
  const [createdByName, setCreatedByName] = useState('')
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
            } catch {
              return { ...task, userName: 'Usuário não encontrado' }
            }
          } else {
            return { ...task, userName: '—' }
          }
        })
      )

      setActivity(activityData)
      setTasks(tasksData)
      filterAndSearch(tasksData, search, filterStartDate, filterEndDate, filterStatus)

      if (activityData.responsible_user_id) {
        try {
          const userRes = await api.get(`/users/${activityData.responsible_user_id}`)
          setResponsibleUserName(userRes.data.name)
        } catch {}
      }

      if (activityData.created_by_id) {
        try {
          const creatorRes = await api.get(`/users/${activityData.created_by_id}`)
          setCreatedByName(creatorRes.data.name)
        } catch {}
      }

      const totalSpent = tasksData.reduce((sum, task) => sum + (parseFloat(task.cost || 0)), 0)
      setSpentBudget(parseFloat(totalSpent.toFixed(2)))

      const totalTime = tasksData.reduce((sum, task) => sum + (parseInt(task.time_spent_minutes || 0)), 0)
      setTotalTimeSpent(totalTime)

    } catch (err) {
      console.error(err)
      setError('Erro ao carregar atividade ou tarefas.')
    }
  }

  useEffect(() => {
    fetchActivityAndTasks()
  }, [activityId])

  const getStatus = (taskDate) => {
    if (!taskDate || !activity?.start_date || !activity?.end_date) return '—'

    const taskD = new Date(taskDate)
    const start = new Date(activity?.start_date)
    const end = new Date(activity?.end_date)

    if (taskD < start) return 'Adiantado'
    if (taskD > end) return 'Atrasado'
    return 'No prazo'
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Adiantado': return 'text-blue-600 font-bold'
      case 'No prazo': return 'text-green-600 font-bold'
      case 'Atrasado': return 'text-red-600 font-bold'
      default: return ''
    }
  }

  const filterAndSearch = (tasksList, searchText, startDate, endDate, statusFilter) => {
    const lowerText = searchText.toLowerCase()

    const results = tasksList.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(lowerText) || (t.userName && t.userName.toLowerCase().includes(lowerText))

      const taskDate = t.date ? t.date.slice(0, 10) : ''
      const status = getStatus(t.date)

      const matchesStartDate = !startDate || taskDate >= startDate
      const matchesEndDate = !endDate || taskDate <= endDate
      const matchesStatus = statusFilter === 'Todos' || status === statusFilter

      return matchesSearch && matchesStartDate && matchesEndDate && matchesStatus
    })

    setFiltered(results)
  }

  const handleSearch = (text) => {
    setSearch(text)
    filterAndSearch(tasks, text, filterStartDate, filterEndDate, filterStatus)
  }

  const handleFilterStartDate = (date) => {
    setFilterStartDate(date)
    filterAndSearch(tasks, search, date, filterEndDate, filterStatus)
  }

  const handleFilterEndDate = (date) => {
    setFilterEndDate(date)
    filterAndSearch(tasks, search, filterStartDate, date, filterStatus)
  }

  const handleFilterStatus = (status) => {
    setFilterStatus(status)
    filterAndSearch(tasks, search, filterStartDate, filterEndDate, status)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'tasks',
    onSuccess: fetchActivityAndTasks
  })

  if (!activity) return <div>Carregando...</div>

  const availableBudget = (parseFloat(activity.allocated_budget || 0) - spentBudget).toFixed(2)
  const isUserAdmin = IsUserAdmin()

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
        <p><strong>Responsável:</strong> {responsibleUserName || '—'}</p>
        <p><strong>Criado por:</strong> {createdByName || '—'}</p>
        <p><strong>Orçamento Alocado:</strong> {activity.allocated_budget ? `R$ ${parseFloat(activity.allocated_budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}</p>
        <p><strong>Valor Gasto Total:</strong> {`R$ ${spentBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</p>
        <p><strong>Valor Disponível:</strong> {`R$ ${parseFloat(availableBudget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</p>
        <p><strong>Tempo Gasto Total:</strong> {`${totalTimeSpent} minutos`}</p>
      </div>

      <h2 className="text-xl font-bold text-green-700 mb-2">Tarefas:</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por título ou autor"
          className="border border-gray-300 rounded p-2 w-full md:w-1/4"
        />

        <select
          value={filterStatus}
          onChange={(e) => handleFilterStatus(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full md:w-1/4"
        >
          <option value="Todos">Todos</option>
          <option value="Adiantado">Adiantado</option>
          <option value="No prazo">No prazo</option>
          <option value="Atrasado">Atrasado</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex flex-col w-full md:w-1/4">
          <label className="text-gray-700 mb-1">Data de Início (mínima)</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => handleFilterStartDate(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
        </div>
        <div className="flex flex-col w-full md:w-1/4">
          <label className="text-gray-700 mb-1">Data de Término (máxima)</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => handleFilterEndDate(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="w-full border bg-white rounded shadow-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left p-2 border-b">Título</th>
            <th className="text-left p-2 border-b">Registrado por</th>
            <th className="text-left p-2 border-b">Data</th>
            <th className="text-left p-2 border-b">Status</th>
            <th className="text-left p-2 border-b">Tempo (min)</th>
            <th className="text-left p-2 border-b">Custo</th>
            {isUserAdmin && <th className="text-left p-2 border-b">Recursos</th>}
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((task) => {
            const status = getStatus(task.date)
            return (
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
                  ) : '—'}
                </td>
                <td className="p-2 border-b">{formatDateBR(task.date)}</td>
                <td className={`p-2 border-b ${getStatusClass(status)}`}>{status}</td>
                <td className="p-2 border-b">{task.time_spent_minutes ?? 0}</td>
                <td className="p-2 border-b">R$ {parseFloat(task.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                {isUserAdmin && (
                  <td className="p-2 border-b">
                    <Link
                      to={`/tasks/${task.id}/documents`}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded"
                    >
                      Documentos
                    </Link>
                  </td>
                )}
                <td className="p-2 border-b space-x-2">
                  <Link
                    to={`/tasks/${task.id}/view`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Visualizar
                  </Link>
                  {isUserAdmin && (
                    <>
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
                    </>
                  )}
                </td>
              </tr>
            )
          })}
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
