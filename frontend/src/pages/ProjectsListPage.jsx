import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'

export default function ProjectsListPage() {
  const [projects, setProjects] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('active')
  const [error, setError] = useState(null)

  const fetchProjects = async () => {
    try {
      const response = await api.get(`/projects`)
      setProjects(response.data)
      filterAndSearch(response.data, search, filterActive)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar projetos.')
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const filterAndSearch = (projectsList, searchText, activeFilter) => {
    const lowerText = searchText.toLowerCase()
    let results = projectsList.filter((p) =>
      p.name.toLowerCase().includes(lowerText) ||
      p.code.toLowerCase().includes(lowerText) ||
      (p.status && p.status.toLowerCase().includes(lowerText))
    )

    if (activeFilter === 'active') {
      results = results.filter(p => p.is_active)
    } else if (activeFilter === 'inactive') {
      results = results.filter(p => !p.is_active)
    }

    setFiltered(results)
  }

  const handleSearch = (text) => {
    setSearch(text)
    filterAndSearch(projects, text, filterActive)
  }

  const handleFilterActive = (value) => {
    setFilterActive(value)
    filterAndSearch(projects, search, value)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'projects',
    onSuccess: fetchProjects
  })

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

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nome, código ou status"
          className="border border-gray-300 rounded p-2 w-full md:w-1/2"
        />

        <select
          value={filterActive}
          onChange={(e) => handleFilterActive(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full md:w-1/4"
        >
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="all">Todos</option>
        </select>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border bg-white rounded shadow-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left p-2 border-b">Nome</th>
            <th className="text-left p-2 border-b">Código</th>
            <th className="text-left p-2 border-b">Descrição</th>
            <th className="text-left p-2 border-b">Status</th>
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
              <td className="p-2 border-b">{project.status || '-'}</td>
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
                  onClick={() => openConfirmModal(project.id)}
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
        message="Tem certeza que deseja excluir este projeto?"
        onConfirm={handleDelete}
        onCancel={closeConfirmModal}
      />
    </div>
  )
}
