import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'

export default function AreasListPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [areas, setAreas] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)

  const token = localStorage.getItem('token')

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/areas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAreas(response.data)
      setFiltered(response.data)
    } catch (err) {
      setError('Erro ao carregar áreas')
      console.error(err)
    }
  }

  useEffect(() => {
    fetchAreas()
  }, [])

  const handleSearch = (text) => {
    setSearch(text)
    const results = areas.filter(a =>
      a.name.toLowerCase().includes(text.toLowerCase())
    )
    setFiltered(results)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'areas',
    token: token,
    onSuccess: fetchAreas
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">Áreas</h2>
        <Link
          to="/areas/create"
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
          {filtered.map((area) => (
            <tr key={area.id}>
              <td className="p-2 border-b">{area.name}</td>
              <td className="p-2 border-b">{area.description}</td>
              <td className="p-2 border-b">{area.is_active ? 'Sim' : 'Não'}</td>
              <td className="p-2 border-b space-x-2">
                <Link
                  to={`/areas/${area.id}/view`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Visualizar
                </Link>
                <Link
                  to={`/areas/${area.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                <button
                  onClick={() => openConfirmModal(area.id)}
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
        message="Tem certeza que deseja excluir esta área?"
        onConfirm={handleDelete}
        onCancel={closeConfirmModal}
      />
    </div>
  )
}
