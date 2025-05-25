import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'
import PublicProfileModal from '../components/PublicProfileModal'

export default function UsersListPage() {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('active')
  const [error, setError] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [rolesMap, setRolesMap] = useState({})

  const fetchUsersAndRoles = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/systemroles')
      ])

      const roles = rolesRes.data.reduce((acc, role) => {
        acc[role.id] = role.name
        return acc
      }, {})

      setRolesMap(roles)
      setUsers(usersRes.data)
      filterAndSearch(usersRes.data, search, filterActive)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar usuários ou papéis.')
    }
  }

  useEffect(() => {
    fetchUsersAndRoles()
  }, [])

  const filterAndSearch = (usersList, searchText, activeFilter) => {
    const lowerText = searchText.toLowerCase()

    let results = usersList.filter((user) => {
      const roleName = rolesMap[user.system_role_id] || ''
      return (
        user.name.toLowerCase().includes(lowerText) ||
        user.email.toLowerCase().includes(lowerText) ||
        roleName.toLowerCase().includes(lowerText)
      )
    })

    if (activeFilter === 'active') {
      results = results.filter(user => user.is_active)
    } else if (activeFilter === 'inactive') {
      results = results.filter(user => !user.is_active)
    }

    setFiltered(results)
  }

  const handleSearch = (text) => {
    setSearch(text)
    filterAndSearch(users, text, filterActive)
  }

  const handleFilterActive = (value) => {
    setFilterActive(value)
    filterAndSearch(users, search, value)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'users',
    onSuccess: fetchUsersAndRoles
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">Usuários</h2>
        <Link
          to="/users/create"
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
          placeholder="Buscar por nome, e-mail ou papel no sistema"
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
            <th className="text-left p-2 border-b">E-mail</th>
            <th className="text-left p-2 border-b">Papel no Sistema</th>
            <th className="text-left p-2 border-b">Ativo</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id}>
              <td className="p-2 border-b">
                <button
                  onClick={() => setSelectedUserId(user.id)}
                  className="text-green-700 hover:underline"
                >
                  {user.name}
                </button>
              </td>
              <td className="p-2 border-b">{user.email}</td>
              <td className="p-2 border-b">{rolesMap[user.system_role_id] || '—'}</td>
              <td className="p-2 border-b">{user.is_active ? 'Sim' : 'Não'}</td>
              <td className="p-2 border-b space-x-2">
                <Link
                  to={`/users/${user.id}/view`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Visualizar
                </Link>
                <Link
                  to={`/users/${user.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                <button
                  onClick={() => openConfirmModal(user.id)}
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
        message="Tem certeza que deseja excluir este usuário?"
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
