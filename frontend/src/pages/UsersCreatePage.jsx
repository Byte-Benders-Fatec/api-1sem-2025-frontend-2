import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import api from '../services/api'
import SuccessModal from '../components/SuccessModal'
import ErrorModal from '../components/ErrorModal'

export default function UserCreatePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [systemRoles, setSystemRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [currentUserRoleLevel, setCurrentUserRoleLevel] = useState(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorModalData, setErrorModalData] = useState({ isOpen: false, title: '', message: '' })

  const navigate = useNavigate()

  useEffect(() => {
    const fetchRolesAndUser = async () => {
      try {
        const [rolesRes, userRes] = await Promise.all([
          api.get('/systemroles'),
          api.get('/auth/me')
        ])
        setSystemRoles(rolesRes.data)
        setCurrentUserRoleLevel(
          rolesRes.data.find(role => role.name === userRes.data.system_role)?.level || 0
        )
      } catch (err) {
        setErrorModalData({
          isOpen: true,
          title: 'Erro',
          message: 'Erro ao carregar permissões.'
        })
      }
    }
    fetchRolesAndUser()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedRole) {
      setErrorModalData({
        isOpen: true,
        title: 'Validação',
        message: 'Selecione um papel para o usuário.'
      })
      return
    }

    try {
      await api.post(`/users`, {
        name,
        email,
        system_role_id: selectedRole.value
      })
      setShowSuccessModal(true)
    } catch (err) {
      setErrorModalData({
        isOpen: true,
        title: 'Erro ao criar usuário',
        message: 'Tente novamente mais tarde.'
      })
    }
  }

  const availableRoles = systemRoles.filter(role =>
    currentUserRoleLevel === 100 || role.level < currentUserRoleLevel
  )

  const roleOptions = availableRoles.map(role => ({
    value: role.id,
    label: role.name,
    description: role.description
  }))

  const selectedRoleDescription = selectedRole ? roleOptions.find(opt => opt.value === selectedRole.value)?.description : ''

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Criar Usuário</h2>

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
          <label className="block font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Papel no Sistema *</label>
          <Select
            value={selectedRole}
            onChange={setSelectedRole}
            options={roleOptions}
            placeholder="Selecione um papel..."
            className="w-full"
          />
        </div>

        {selectedRoleDescription && (
          <div className="text-gray-600 text-sm p-2 border rounded bg-gray-50">
            <strong>Descrição:</strong> {selectedRoleDescription}
          </div>
        )}

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
            Criar
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        title="Usuário Criado!"
        message="O usuário foi criado com sucesso."
        onClose={() => navigate('/users')}
      />

      <ErrorModal
        isOpen={errorModalData.isOpen}
        title={errorModalData.title}
        message={errorModalData.message}
        onClose={() => setErrorModalData({ isOpen: false, title: '', message: '' })}
      />
    </div>
  )
}
