import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function ProjectsListPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [projects, setProjects] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const token = localStorage.getItem('token')

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects(response.data)
      setFiltered(response.data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar projetos.')
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSearch = (text) => {
    setSearch(text)
    const results = projects.filter((p) =>
      p.name.toLowerCase().includes(text.toLowerCase())
    )
    setFiltered(results)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este projeto?')) return
    try {
      await axios.delete(`${API_BASE_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchProjects()
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir projeto.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">Projetos</h2>
        <Link
          to="/projects/create"
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
            <th className="text-left p-2 border-b">Código</th>
            <th className="text-left p-2 border-b">Descrição</th>
            <th className="text-left p-2 border-b">Ativo</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((project) => (
            <tr key={project.id}>
              <td className="p-2 border-b">{project.name}</td>
              <td className="p-2 border-b">{project.code}</td>
              <td className="p-2 border-b">{project.description}</td>
              <td className="p-2 border-b">{project.is_active ? 'Sim' : 'Não'}</td>
              <td className="p-2 border-b space-x-2">
                <Link
                  to={`/projects/${project.id}/view`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Visualizar
                </Link>
                <Link
                  to={`/projects/${project.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(project.id)}
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
