import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { downloadDocument, viewDocument } from '../utils/fileHelpers'
import useConfirmDelete from '../hooks/useConfirmDelete'
import ConfirmModal from '../components/ConfirmModal'
import DocumentUploadModal from '../components/DocumentUploadModal'
import DocumentEditModal from '../components/DocumentEditModal'
import PublicProfileModal from '../components/PublicProfileModal'
import { formatDateBR } from '../utils/formatDate'

export default function DocumentsByEntityPage({ entityType }) {
  const { id: entityId } = useParams()
  const navigate = useNavigate()

  const [documents, setDocuments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('active')
  const [error, setError] = useState(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [editingDocId, setEditingDocId] = useState(null)
  const [entity, setEntity] = useState(null)
  const [creator, setCreator] = useState(null)
  const [responsible, setResponsible] = useState(null)
  const [user, setUser] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)

  const entityPaths = {
    project: 'projects',
    activity: 'activities',
    task: 'tasks'
  }

  const fetchDocuments = async () => {
    try {
      const path = entityPaths[entityType]
      const res = await api.get(`/${path}/${entityId}/documents`)
      setDocuments(res.data)
      filterAndSearch(res.data, search, filterActive)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar documentos.')
    }
  }

  const fetchEntityDetails = async () => {
    try {
      const path = entityPaths[entityType]
      const res = await api.get(`/${path}/${entityId}`)
      setEntity(res.data)

      // Buscar criador, responsável e usuário se existirem
      if (res.data.created_by_id) {
        const creatorRes = await api.get(`/users/${res.data.created_by_id}`)
        setCreator(creatorRes.data)
      }
      if (res.data.responsible_user_id) {
        const responsibleRes = await api.get(`/users/${res.data.responsible_user_id}`)
        setResponsible(responsibleRes.data)
      }
      if (res.data.user_id) {
        const userRes = await api.get(`/users/${res.data.user_id}`)
        setUser(userRes.data)
      }
    } catch (err) {
      console.error('Erro ao carregar entidade.')
    }
  }

  useEffect(() => {
    fetchDocuments()
    fetchEntityDetails()
  }, [entityId])

  const filterAndSearch = (docs, text, active) => {
    const lower = text.toLowerCase()
    let result = docs.filter((d) =>
      d.name.toLowerCase().includes(lower) ||
      (d.mime_type && d.mime_type.toLowerCase().includes(lower))
    )

    if (active === 'active') {
      result = result.filter(d => d.is_active)
    } else if (active === 'inactive') {
      result = result.filter(d => !d.is_active)
    }

    setFiltered(result)
  }

  const handleSearch = (value) => {
    setSearch(value)
    filterAndSearch(documents, value, filterActive)
  }

  const handleFilterActive = (value) => {
    setFilterActive(value)
    filterAndSearch(documents, search, value)
  }

  const { confirmOpen, openConfirmModal, closeConfirmModal, handleDelete } = useConfirmDelete({
    entity: 'documents',
    onSuccess: fetchDocuments
  })

  const renderEntityHeader = () => {
    if (!entity) return null

    const labelMap = {
      project: 'Projeto',
      activity: 'Atividade',
      task: 'Tarefa'
    }

    return (
      <>
        <h2 className="text-xl font-bold text-green-700 mb-2">{labelMap[entityType]}</h2>
        <div className="mb-6 space-y-1">
          {entity.code && <p><strong>Código:</strong> {entity.code}</p>}
          {entity.name && <p><strong>Nome:</strong> {entity.name}</p>}
          {entity.title && <p><strong>Título:</strong> {entity.title}</p>}
          {entity.description && <p><strong>Descrição:</strong> {entity.description}</p>}
          {entity.start_date && <p><strong>Data de Início:</strong> {formatDateBR(entity.start_date)}</p>}
          {entity.end_date && <p><strong>Data de Término:</strong> {formatDateBR(entity.end_date)}</p>}
          {entity.date && <p><strong>Data:</strong> {formatDateBR(entity.date)}</p>}
          {responsible && <p><strong>Responsável: </strong> 
            <button
              onClick={() => setSelectedUserId(responsible?.id)}
              className="text-green-700 hover:underline"
            >
              {responsible?.name}
            </button>
          </p>}
          {creator && <p><strong>Criado por: </strong>
            <button
              onClick={() => setSelectedUserId(creator?.id)}
              className="text-green-700 hover:underline"
            >
              {creator?.name}
            </button>
          </p>}          
          {user && <p><strong>Registrado por: </strong>
            <button
              onClick={() => setSelectedUserId(user?.id)}
              className="text-green-700 hover:underline"
            >
              {user?.name}
            </button>
          </p>}
        </div>
      </>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ← Voltar
        </button>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Enviar Documento
        </button>
      </div>

      {renderEntityHeader()}

      <h2 className="text-xl font-bold text-green-700 mb-4">Documentos</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nome ou tipo"
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

      {error && <p className="text-red-600 mb-4">{error}</p>}

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
                <button
                  onClick={() => downloadDocument(doc)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                >
                  Baixar
                </button>
                <button
                  onClick={() => viewDocument(doc)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Visualizar
                </button>
                <button
                  onClick={() => setEditingDocId(doc.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
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

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        entityType={entityType}
        entityId={entityId}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchDocuments}
      />

      <DocumentEditModal
        isOpen={Boolean(editingDocId)}
        documentId={editingDocId}
        onClose={() => setEditingDocId(null)}
        onSuccess={() => {
          setEditingDocId(null)
          fetchDocuments()
        }}
      />

      <PublicProfileModal
        isOpen={!!selectedUserId}
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  )
}
