import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import api from '../services/api'
import SuccessModal from '../components/SuccessModal'
import ConfirmModal from '../components/ConfirmModal'

export default function TeamEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState(null)

  const [availableUsers, setAvailableUsers] = useState([])
  const [teamUsers, setTeamUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [confirmRemoveUserId, setConfirmRemoveUserId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, usersRes, availableUsersRes] = await Promise.all([
          api.get(`/teams/${id}`),
          api.get(`/teams/${id}/users`),
          api.get(`/teams/${id}/available-users`)
        ])

        setName(teamRes.data.name)
        setDescription(teamRes.data.description || '')
        setIsActive(teamRes.data.is_active === 1)
        setTeamUsers(usersRes.data)
        setAvailableUsers(availableUsersRes.data)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar informações do time.')
      }
    }
    fetchData()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      await api.put(`/teams/${id}`, { name, description, is_active: isActive ? 1 : 0 })
      setSuccessMessage('O time foi atualizado com sucesso.')
      setShowSuccessModal(true)
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar time.')
    }
  }

  const handleAddUser = async () => {
    if (!selectedUser) return

    try {
      await api.post(`/teams/${id}/users`, { user_id: selectedUser })
      const user = availableUsers.find(u => u.id === selectedUser)
      setTeamUsers(prev => [...prev, user])
      setAvailableUsers(prev => prev.filter(u => u.id !== selectedUser))
      setSelectedUser('')
      setSuccessMessage('Integrante adicionado com sucesso.')
      setShowSuccessModal(true)
    } catch (err) {
      console.error(err)
      setError('Erro ao adicionar usuário ao time.')
    }
  }

  const handleConfirmRemoveUser = async () => {
    if (!confirmRemoveUserId) return

    try {
      await api.delete(`/teams/${id}/users/${confirmRemoveUserId}`)
      const user = teamUsers.find(u => u.id === confirmRemoveUserId)
      setAvailableUsers(prev => [...prev, user])
      setTeamUsers(prev => prev.filter(u => u.id !== confirmRemoveUserId))
      setConfirmRemoveUserId(null)
    } catch (err) {
      console.error(err)
      setError('Erro ao remover usuário do time.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Editar Time</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Nome</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label className="text-gray-700">Time ativo</label>
        </div>

        {/* INTEGRANTES DO TIME */}
        <div className="mt-10 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Integrantes do Time</h3>

          <div className="flex gap-4">
            <div className="flex-1">
              <Select
                value={availableUsers.find(u => u.id === selectedUser) ? {
                  value: selectedUser,
                  label: availableUsers.find(u => u.id === selectedUser)?.name + ' (' + availableUsers.find(u => u.id === selectedUser)?.email + ')'
                } : null}
                onChange={(option) => setSelectedUser(option?.value || '')}
                options={availableUsers.map(user => ({
                  value: user.id,
                  label: `${user.name} (${user.email})`
                }))}
                placeholder="Selecione um usuário..."
                className="w-full"
              />
            </div>

            <button
              type="button"
              onClick={handleAddUser}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Adicionar
            </button>
          </div>

          <ul className="mt-4">
            {teamUsers.map(user => (
              <li key={user.id} className="flex justify-between items-center border-b py-1">
                <span>{user.name} ({user.email})</span>
                <button
                  type="button"
                  onClick={() => setConfirmRemoveUserId(user.id)}
                  className="text-red-600 text-sm"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            ← Voltar
          </button>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Salvar Alterações
          </button>
        </div>
      </form>

      {/* MODAIS */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Sucesso!"
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      <ConfirmModal
        isOpen={!!confirmRemoveUserId}
        title="Remover Integrante"
        message="Deseja realmente remover este integrante do time?"
        onConfirm={handleConfirmRemoveUser}
        onCancel={() => setConfirmRemoveUserId(null)}
      />
    </div>
  )
}
