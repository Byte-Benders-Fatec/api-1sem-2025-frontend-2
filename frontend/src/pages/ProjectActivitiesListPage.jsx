import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'
import { formatDateBR } from '../utils/formatDate'
import { GetUserByJwtToken, IsUserAdmin}  from '../utils/cookie'

export default function ProjectActivitiesListPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [activities, setActivities] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('active')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [error, setError] = useState(null)
  const [responsibleUserName, setResponsibleUserName] = useState('')
  const [createdByName, setCreatedByName] = useState('')
  const [spentBudget, setSpentBudget] = useState(0)
  const user = GetUserByJwtToken();
  const isUserAdmin = IsUserAdmin();

  const fetchProjectAndActivities = async () => {
    try {
      const [projectRes, activitiesRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/activities`)
      ])
      const projectData = projectRes.data
      setProject(projectData)
      setActivities(activitiesRes.data)
      await filterAndSearch(activitiesRes.data, search, filterActive, filterStartDate, filterEndDate)

      if (projectData.responsible_user_id) {
        try {
          const userRes = await api.get(`/users/${projectData.responsible_user_id}`)
          setResponsibleUserName(userRes.data.name)
        } catch (err) {
          console.error('Erro ao carregar usuário responsável.')
        }
      }

      if (projectData.created_by_id) {
        try {
          const creatorRes = await api.get(`/users/${projectData.created_by_id}`)
          setCreatedByName(creatorRes.data.name)
        } catch (err) {
          console.error('Erro ao carregar usuário criador.')
        }
      }

      const totalSpent = activitiesRes.data.reduce(
        (sum, activity) => sum + (parseFloat(activity.allocated_budget || 0)),
        0
      )
      setSpentBudget(parseFloat(totalSpent.toFixed(2)))

    } catch (err) {
      console.error(err)
      setError('Erro ao carregar informações do projeto ou atividades.')
    }
  }

  useEffect(() => {
    fetchProjectAndActivities()
  }, [projectId])

  const filterAndSearch = async (activitiesList, searchText, activeFilter, startDateFilter, endDateFilter) => {
    const lowerText = searchText.toLowerCase()
    activitiesList = await filterActivitiesByUserPermission(activitiesList);
    let results = activitiesList.filter((a) =>
      a.name.toLowerCase().includes(lowerText) ||
      (a.status && a.status.toLowerCase().includes(lowerText))
    )

    if (activeFilter === 'active') {
      results = results.filter(a => a.is_active)
    } else if (activeFilter === 'inactive') {
      results = results.filter(a => !a.is_active)
    }

    if (startDateFilter) {
      results = results.filter(a => a.start_date && a.start_date.slice(0, 10) >= startDateFilter)
    }

    if (endDateFilter) {
      results = results.filter(a => a.end_date && a.end_date.slice(0, 10) <= endDateFilter)
    }

    setFiltered(results)
  }

  const filterActivitiesByUserPermission = async (activitiesList) => {
    if (isUserAdmin) return activitiesList;

    const result = [];

    await Promise.all(
      activitiesList.map(async (activity) => {
        try {
          const res = await api.get(`/activities/${activity.id}/users`);
          const activityUsers = res.data;

          const userIsInActivity = activityUsers.some(
            (u) => u.id === user.id
          );

          if (userIsInActivity) {
            result.push(activity);
          }
        } catch (e) {
          console.error(`Erro ao verificar permissões da atividade ${activity.id}`);
        }
      })
    );

    return result;
  };

  const handleSearch = (text) => {
    setSearch(text)
    filterAndSearch(activities, text, filterActive, filterStartDate, filterEndDate)
  }

  const handleFilterActive = (value) => {
    setFilterActive(value)
    filterAndSearch(activities, search, value, filterStartDate, filterEndDate)
  }

  const handleStartDateChange = (value) => {
    setFilterStartDate(value)
    filterAndSearch(activities, search, filterActive, value, filterEndDate)
  }

  const handleEndDateChange = (value) => {
    setFilterEndDate(value)
    filterAndSearch(activities, search, filterActive, filterStartDate, value)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'activities',
    onSuccess: fetchProjectAndActivities
  })

  if (!project) {
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

        {isUserAdmin &&
          <Link
            to={`/projects/${projectId}/activities/create`}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Criar Nova Atividade
          </Link>
        }
      </div>

      <h2 className="text-xl font-bold text-green-700 mb-2">Projeto</h2>
      <div className="mb-6 space-y-1">
        <p><strong>Código:</strong> {project.code}</p>
        <p><strong>Nome:</strong> {project.name}</p>
        <p><strong>Descrição:</strong> {project.description || '—'}</p>
        <p><strong>Status:</strong> {project.status || '—'}</p>
        <p><strong>Data de Início:</strong> {formatDateBR(project.start_date)}</p>
        <p><strong>Data de Término:</strong> {formatDateBR(project.end_date)}</p>
        <p><strong>Responsável:</strong> {responsibleUserName || '—'}</p>
        <p><strong>Criado por:</strong> {createdByName || '—'}</p>
        <p><strong>Orçamento Total:</strong> {project.budget
          ? `R$ ${parseFloat(project.budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : '—'}</p>
        <p><strong>Valor Alocado:</strong> {`R$ ${parseFloat(spentBudget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</p>
        <p><strong>Valor Disponível:</strong> {project.budget
          ? `R$ ${(parseFloat(project.budget) - parseFloat(spentBudget)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : '—'}</p>
      </div>

      <h2 className="text-xl font-bold text-green-700 mb-2">Atividades:</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nome ou status"
          className="border border-gray-300 rounded p-2 w-full md:w-1/4"
        />

        <select
          value={filterActive}
          onChange={(e) => handleFilterActive(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full md:w-1/4"
        >
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
          <option value="all">Todas</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex flex-col w-full md:w-1/4">
          <label className="text-gray-700 mb-1">Data de Início (mínima)</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
        </div>
        <div className="flex flex-col w-full md:w-1/4">
          <label className="text-gray-700 mb-1">Data de Término (máxima)</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="w-full border bg-white rounded shadow-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left p-2 border-b">Nome</th>
            <th className="text-left p-2 border-b">Status</th>
            <th className="text-left p-2 border-b">Orçamento da Atividade</th>
            <th className="text-left p-2 border-b">Data de Início</th>
            <th className="text-left p-2 border-b">Data de Término</th>
            <th className="text-left p-2 border-b">Ativo</th>
            <th className="text-left p-2 border-b">Recursos</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((activity) => (
            <tr key={activity.id}>
              <td className="p-2 border-b">{activity.name}</td>
              <td className="p-2 border-b">{activity.status || '—'}</td>
              <td className="p-2 border-b">
                {activity.allocated_budget
                  ? `R$ ${parseFloat(activity.allocated_budget).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}`
                  : '—'}
              </td>
              <td className="p-2 border-b">{formatDateBR(activity.start_date)}</td>
              <td className="p-2 border-b">{formatDateBR(activity.end_date)}</td>
              <td className="p-2 border-b">{activity.is_active ? 'Sim' : 'Não'}</td>
              <td className="p-2 border-b space-x-2">
                <Link
                  to={`/activities/${activity.id}/tasks`}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Tarefas
                </Link>
                {isUserAdmin &&
                  <Link
                    to={`/activities/${activity.id}/documents`}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded"
                  >
                    Documentos
                  </Link>
                }
              </td>
              <td className="p-2 border-b space-x-2">
                <Link
                  to={`/activities/${activity.id}/view`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Visualizar
                </Link>
                {isUserAdmin && <Link
                  to={`/activities/${activity.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                }
                {isUserAdmin && <button
                  onClick={() => openConfirmModal(activity.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Excluir
                </button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta atividade?"
        onConfirm={handleDelete}
        onCancel={closeConfirmModal}
      />
    </div>
  )
}
