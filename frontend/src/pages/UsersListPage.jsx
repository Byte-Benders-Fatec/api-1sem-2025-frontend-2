import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'

export default function UsersListPage() {

  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/users`)
      setUsers(response.data)
      setFiltered(response.data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar usuários.')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = (text) => {
    setSearch(text)
    const results = users.filter(
      (user) =>
        user.name.toLowerCase().includes(text.toLowerCase()) ||
        user.email.toLowerCase().includes(text.toLowerCase())
    )
    setFiltered(results)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'users',
    onSuccess: fetchUsers
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

      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por nome ou email"
        className="border border-gray-300 rounded p-2 mb-4 w-full max-w-md"
      />

      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border bg-white rounded shadow-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left p-2 border-b">Nome</th>
            <th className="text-left p-2 border-b">Email</th>
            <th className="text-left p-2 border-b">Ativo</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id}>
              <td className="p-2 border-b">{user.name}</td>
              <td className="p-2 border-b">{user.email}</td>
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
    </div>
  )
}
