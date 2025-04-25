import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import api from '../services/api'
import SuccessModal from '../components/SuccessModal'

export default function TeamsCreatePage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [teamUsers, setTeamUsers] = useState([])
  const [error, setError] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/users`)
        setAvailableUsers(res.data)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar usuários.')
      }
    }
    fetchUsers()
  }, [])

  const handleAddUser = () => {
    if (!selectedUser) return

    const user = availableUsers.find(u => u.id === selectedUser)
    setTeamUsers(prev => [...prev, user])
    setAvailableUsers(prev => prev.filter(u => u.id !== selectedUser))
    setSelectedUser('')
  }

  const handleRemoveUser = (userId) => {
    const user = teamUsers.find(u => u.id === userId)
    setAvailableUsers(prev => [...prev, user])
    setTeamUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (teamUsers.length === 0) {
      setError('Adicione pelo menos um integrante ao time antes de criar.')
      return
    }

    try {
      const res = await api.post(`/teams`, { name, description })
      const newTeamId = res.data.id

      await Promise.all(
        teamUsers.map(user =>
          api.post(`/teams/${newTeamId}/users`, { user_id: user.id })
        )
      )

      // Limpa o formulário após criar
      setName('')
      setDescription('')
      setAvailableUsers(prev => [...prev, ...teamUsers])
      setTeamUsers([])
      setSelectedUser('')
      setShowSuccessModal(true)

    } catch (err) {
      setError('Erro ao criar time.')
      console.error(err)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Criar Time</h2>

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

        <div className="mt-6">
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
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-red-600 text-sm"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="text-red-600 mt-4">{error}</p>}

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
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={teamUsers.length === 0}
          >
            Criar
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        title="Time Criado!"
        message="O time foi criado com sucesso."
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  )
}
