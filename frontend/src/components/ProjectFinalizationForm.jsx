import { useEffect, useState } from 'react'
import api from '../services/api'
import Select from 'react-select'
import SuccessModal from '../components/SuccessModal'

export default function ProjectFinalizationForm({ projectId, createdById, onComplete, onBack, isEditing }) {
  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [error, setError] = useState(null)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/users`)
        const users = res.data

        const options = users.map(user => ({
          value: user.id,
          label: `${user.name} (${user.email})`
        }))

        setAvailableUsers(options)

        const defaultUser = options.find(opt => opt.value === createdById)
        setSelectedUser(defaultUser || null)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar usuários disponíveis.')
      }
    }

    fetchUsers()
  }, [projectId, createdById])

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError('Selecione um responsável para o projeto.')
      return
    }

    try {
      await api.put(`/projects/${projectId}`, {
        responsible_user_id: selectedUser.value
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
        <label className="block font-semibold text-gray-700 mb-2">Responsável pelo Projeto *</label>
        <Select
          options={availableUsers}
          value={selectedUser}
          onChange={(option) => setSelectedUser(option)}
          placeholder="Selecione um responsável..."
          isClearable
        />
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
