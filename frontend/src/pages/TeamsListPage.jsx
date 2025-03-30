import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function TeamsListPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [teams, setTeams] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)

  const token = localStorage.getItem('token')

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTeams(response.data)
      setFiltered(response.data)
    } catch (err) {
      setError('Erro ao carregar os times')
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const handleSearch = (text) => {
    setSearch(text)
    const results = teams.filter(t => t.name.toLowerCase().includes(text.toLowerCase()))
    setFiltered(results)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este time?')) return
    try {
      await axios.delete(`${API_BASE_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTeams()
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir time.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">Times</h2>
        <Link
          to="/teams/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Criar Novo
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por nome"
        className="border border-gray-300 rounded p-2 mb-4 w-full max-w-md"
      />

      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border bg-white rounded shadow-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left p-2 border-b">Nome</th>
            <th className="text-left p-2 border-b">Descrição</th>
            <th className="text-left p-2 border-b">Ativo</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((team) => (
            <tr key={team.id}>
              <td className="p-2 border-b">{team.name}</td>
              <td className="p-2 border-b">{team.description}</td>
              <td className="p-2 border-b">{team.is_active ? 'Sim' : 'Não'}</td>
              <td className="p-2 border-b space-x-2">
                <Link
                  to={`/teams/${team.id}/view`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Visualizar
                </Link>
                <Link
                  to={`/teams/${team.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(team.id)}
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
