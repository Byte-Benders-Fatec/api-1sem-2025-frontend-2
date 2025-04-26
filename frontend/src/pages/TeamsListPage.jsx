import { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'

export default function TeamsListPage() {
  const [teams, setTeams] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('active')
  const [error, setError] = useState(null)

  const fetchTeams = async () => {
    try {
      const response = await api.get(`/teams`)
      setTeams(response.data)
      filterAndSearch(response.data, search, filterActive)
    } catch (err) {
      setError('Erro ao carregar times')
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const filterAndSearch = (teamsList, searchText, activeFilter) => {
    const lowerText = searchText.toLowerCase()
    let results = teamsList.filter((t) =>
      t.name.toLowerCase().includes(lowerText) ||
      (t.description && t.description.toLowerCase().includes(lowerText))
    )

    if (activeFilter === 'active') {
      results = results.filter(t => t.is_active)
    } else if (activeFilter === 'inactive') {
      results = results.filter(t => !t.is_active)
    }

    setFiltered(results)
  }

  const handleSearch = (text) => {
    setSearch(text)
    filterAndSearch(teams, text, filterActive)
  }

  const handleFilterActive = (value) => {
    setFilterActive(value)
    filterAndSearch(teams, search, value)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'teams',
    onSuccess: fetchTeams
  })

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

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nome ou descrição"
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
                  onClick={() => openConfirmModal(team.id)}
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
        message="Tem certeza que deseja excluir este time?"
        onConfirm={handleDelete}
        onCancel={closeConfirmModal}
      />
    </div>
  )
}
