import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'

export default function DocumentsListPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [documents, setDocuments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const token = localStorage.getItem('token')

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDocuments(res.data)
      setFiltered(res.data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar documentos.')
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleSearch = (text) => {
    setSearch(text)
    const results = documents.filter((d) =>
      d.name.toLowerCase().includes(text.toLowerCase())
    )
    setFiltered(results)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'documents',
    token: token,
    onSuccess: fetchDocuments
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">Documentos</h2>
        <Link
          to="/documents/upload"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Enviar Documento
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
            <th className="text-left p-2 border-b">Tipo</th>
            <th className="text-left p-2 border-b">Ativo</th>
            <th className="text-left p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((doc) => (
            <tr key={doc.id}>
              <td className="p-2 border-b">{doc.name}</td>
              <td className="p-2 border-b">{doc.mime_type}</td>
              <td className="p-2 border-b">{doc.is_active ? 'Sim' : 'Não'}</td>
              <td className="p-2 border-b space-x-2">
                <a
                  href={`${API_BASE_URL}/documents/${doc.id}/download`}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                >
                  Baixar
                </a>
                <a
                  href={`${API_BASE_URL}/documents/${doc.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Visualizar
                </a>
                <Link
                  to={`/documents/${doc.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                <button
                  onClick={() => openConfirmModal(doc.id)}
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
        message="Tem certeza que deseja excluir este documento?"
        onConfirm={handleDelete}
        onCancel={closeConfirmModal}
      />
    </div>
  )
}
