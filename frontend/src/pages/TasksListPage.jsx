import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function TasksListPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [tasks, setTasks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const token = localStorage.getItem('token')

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(res.data)
      setFiltered(res.data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar tarefas.')
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleSearch = (text) => {
    setSearch(text)
    const results = tasks.filter((t) =>
      t.title.toLowerCase().includes(text.toLowerCase())
    )
    setFiltered(results)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir esta tarefa?')) return
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTasks()
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir tarefa.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">Tarefas</h2>
        <Link
          to="/tasks/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Criar Nova
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por título"
        className="border border-gray-300 rounded p-2 mb-4 w-full max-w-md"
      />

      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border bg-white rounded shadow-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left p-2 border-b">Título</th>
            <th className="text-left p-2 border-b">Atividade</th>
            <th className="text-left p-2 border-b">Tempo (min)</th>
            <th className="text-left p-2 border-b">Custo</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((task) => (
            <tr key={task.id}>
              <td className="p-2 border-b">{task.title}</td>
              <td className="p-2 border-b">{task.activity?.name || '—'}</td>
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
                  onClick={() => handleDelete(task.id)}
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
