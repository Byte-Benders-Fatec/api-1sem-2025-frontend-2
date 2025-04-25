import { useEffect, useState } from 'react'
import api from '../services/api'
import DocumentUploadForm from './DocumentUploadForm'

export default function ProjectFinalizationForm({ projectId, createdById, onComplete }) {
  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(createdById)
  const [error, setError] = useState(null)
  const [showDocUpload, setShowDocUpload] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/users`)
        setAvailableUsers(res.data)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar usuários disponíveis.')
      }
    }

    fetchUsers()
  }, [projectId])

  const handleSubmit = async () => {
    try {
      await api.put(`/projects/${projectId}`, {
        responsible_user_id: selectedUserId
      })
      onComplete()
    } catch (err) {
      console.error(err)
      setError('Erro ao definir responsável.')
    }
  }
  // responsible_user_id
  return (
    <div className="max-w-3xl space-y-6">
      {error && <p className="text-red-600">{error}</p>}

      {/* RESPONSÁVEL */}
      <div>
        <label className="block font-semibold text-gray-700">Responsável pelo Projeto *</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          {availableUsers.map(user => (
            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
          ))}
        </select>
      </div>

      {/* DOCUMENTOS (Opcional) */}
      <div className="mt-6">
        <button
          onClick={() => setShowDocUpload(!showDocUpload)}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          {showDocUpload ? 'Ocultar Upload de Documento' : 'Adicionar Documento (Opcional)'}
        </button>
        {showDocUpload && (
          <div className="mt-4">
            <DocumentUploadForm
              EntityId={projectId}
              EntityType="project"
              onUploadSuccess={() => alert('Documento adicionado com sucesso!')}
              onClose={() => setShowDocUpload(false)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8 gap-4">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Finalizar Projeto
        </button>
      </div>
    </div>
  )
}
