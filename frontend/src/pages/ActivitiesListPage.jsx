import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function ActivitiesListPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [activities, setActivities] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)

  const token = localStorage.getItem('token')

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setActivities(res.data)
      setFiltered(res.data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar atividades.')
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleSearch = (text) => {
    setSearch(text)
    const results = activities.filter((a) =>
      a.name.toLowerCase().includes(text.toLowerCase())
    )
    setFiltered(results)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir esta atividade?')) return
    try {
      await axios.delete(`${API_BASE_URL}/activities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchActivities()
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir atividade.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">Atividades</h2>
        <Link
          to="/activities/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Criar Nova
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por nome da atividade"
        className="border border-gray-300 rounded p-2 mb-4 w-full max-w-md"
      />

      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border bg-white rounded shadow-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left p-2 border-b">Nome</th>
            <th className="text-left p-2 border-b">Projeto</th>
            <th className="text-left p-2 border-b">Status</th>
            <th className="text-left p-2 border-b">Orçamento</th>
            <th className="text-left p-2 border-b">Período</th>
            <th className="text-left p-2 border-b">Ativo</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((activity) => (
            <tr key={activity.id}>
              <td className="p-2 border-b">{activity.name}</td>
              <td className="p-2 border-b">
                {activity.project?.code || '—'}
              </td>
              <td className="p-2 border-b">{activity.status || '—'}</td>
              <td className="p-2 border-b">
                {activity.allocated_budget
                  ? `R$ ${parseFloat(activity.allocated_budget).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}`
                  : '—'}
              </td>
              <td className="p-2 border-b">
                {activity.start_date?.split('T')[0]} até {activity.end_date?.split('T')[0]}
              </td>
              <td className="p-2 border-b">{activity.is_active ? 'Sim' : 'Não'}</td>
              <td className="p-2 border-b space-x-2">
                <Link
                  to={`/activities/${activity.id}/view`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Visualizar
                </Link>
                <Link
                  to={`/activities/${activity.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
