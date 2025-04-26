import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'

export default function AgenciesListPage() {
  const [agencies, setAgencies] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('active')
  const [error, setError] = useState(null)

  const fetchAgencies = async () => {
    try {
      const response = await api.get(`/agencies`)
      setAgencies(response.data)
      filterAndSearch(response.data, search, filterActive)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar agências.')
    }
  }

  useEffect(() => {
    fetchAgencies()
  }, [])

  const filterAndSearch = (agenciesList, searchText, activeFilter) => {
    const lowerText = searchText.toLowerCase()
    let results = agenciesList.filter((a) =>
      (a.acronym && a.acronym.toLowerCase().includes(lowerText)) ||
      a.name.toLowerCase().includes(lowerText) ||
      (a.cnpj && a.cnpj.toLowerCase().includes(lowerText))
    )

    if (activeFilter === 'active') {
      results = results.filter(a => a.is_active)
    } else if (activeFilter === 'inactive') {
      results = results.filter(a => !a.is_active)
    }

    setFiltered(results)
  }

  const handleSearch = (text) => {
    setSearch(text)
    filterAndSearch(agencies, text, filterActive)
  }

  const handleFilterActive = (value) => {
    setFilterActive(value)
    filterAndSearch(agencies, search, value)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'agencies',
    onSuccess: fetchAgencies
  })

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

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por sigla, nome ou CNPJ"
          className="border border-gray-300 rounded p-2 w-full md:w-1/2"
        />

        <select
          value={filterActive}
          onChange={(e) => handleFilterActive(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full md:w-1/4"
        >
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
          <option value="all">Todas</option>
        </select>
      </div>

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
                  onClick={() => openConfirmModal(agency.id)}
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
        message="Tem certeza que deseja excluir esta agência?"
        onConfirm={handleDelete}
        onCancel={closeConfirmModal}
      />
    </div>
  )
}
