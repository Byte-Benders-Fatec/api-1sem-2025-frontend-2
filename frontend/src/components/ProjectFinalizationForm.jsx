import { useEffect, useState } from 'react'
import api from '../services/api'
import DocumentUploadForm from './DocumentUploadForm'
import SuccessModal from '../components/SuccessModal'

export default function ProjectFinalizationForm({ projectId, createdById, onComplete, onBack, isEditing }) {
  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(createdById)
  const [error, setError] = useState(null)
  const [showDocUpload, setShowDocUpload] = useState(false)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

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
      setSuccessMessage(isEditing ? 'Alterações salvas com sucesso!' : 'Projeto concluído com sucesso!')
      setShowSuccessModal(true)
    } catch (err) {
      console.error(err)
      setError('Erro ao definir responsável.')
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    onComplete()
  }

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

      {/* BOTÕES */}
      <div className="flex justify-between mt-8 gap-4">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
        >
          ← Voltar
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          {isEditing ? 'Salvar Alterações' : 'Concluir Projeto'}
        </button>
      </div>

      {/* MODAL DE SUCESSO */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Sucesso!"
        message={successMessage}
        onClose={handleSuccessClose}
      />
    </div>
  )
}
