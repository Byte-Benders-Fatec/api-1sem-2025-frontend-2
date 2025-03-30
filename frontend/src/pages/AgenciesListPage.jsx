import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function AgenciesListPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [agencies, setAgencies] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const token = localStorage.getItem('token')

  const fetchAgencies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/agencies`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAgencies(response.data)
      setFiltered(response.data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar agências.')
    }
  }

  useEffect(() => {
    fetchAgencies()
  }, [])

  const handleSearch = (text) => {
    setSearch(text)
    const filteredList = agencies.filter((a) =>
      a.name.toLowerCase().includes(text.toLowerCase()) ||
      a.cnpj.toLowerCase().includes(text.toLowerCase())
    )
    setFiltered(filteredList)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir esta agência?')) return
    try {
      await axios.delete(`${API_BASE_URL}/agencies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAgencies()
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir agência.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">Agências Financiadoras</h2>
        <Link
          to="/agencies/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Criar Nova
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por nome ou CNPJ"
        className="border border-gray-300 rounded p-2 mb-4 w-full max-w-md"
      />

      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border bg-white rounded shadow-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left p-2 border-b">Sigla</th>
            <th className="text-left p-2 border-b">Nome</th>
            <th className="text-left p-2 border-b">CNPJ</th>
            <th className="text-left p-2 border-b">Ativo</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((agency) => (
            <tr key={agency.id}>
              <td className="p-2 border-b">{agency.acronym}</td>
              <td className="p-2 border-b">{agency.name}</td>
              <td className="p-2 border-b">{agency.cnpj}</td>
              <td className="p-2 border-b">{agency.is_active ? 'Sim' : 'Não'}</td>
              <td className="p-2 border-b space-x-2">
                <Link
                  to={`/agencies/${agency.id}/view`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Visualizar
                </Link>
                <Link
                  to={`/agencies/${agency.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(agency.id)}
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
