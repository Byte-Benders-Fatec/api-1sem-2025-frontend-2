import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import api from '../services/api'
import SuccessModal from '../components/SuccessModal'
import ErrorModal from '../components/ErrorModal'

export default function UserEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [systemRoles, setSystemRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [currentUserRoleLevel, setCurrentUserRoleLevel] = useState(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorModalData, setErrorModalData] = useState({ isOpen: false, title: '', message: '' })

  useEffect(() => {
    const fetchUserAndRoles = async () => {
      try {
        const [userRes, rolesRes, currentUserRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get('/systemroles'),
          api.get('/auth/me')
        ])

        setName(userRes.data.name)
        setEmail(userRes.data.email)
        setIsActive(userRes.data.is_active === 1)
        setSystemRoles(rolesRes.data)

        setSelectedRole({
          value: userRes.data.system_role_id,
          label: rolesRes.data.find(r => r.id === userRes.data.system_role_id)?.name || ''
        })

        setCurrentUserRoleLevel(
          rolesRes.data.find(role => role.name === currentUserRes.data.system_role)?.level || 0
        )
      } catch (err) {
        setErrorModalData({
          isOpen: true,
          title: 'Erro',
          message: 'Erro ao carregar informações do usuário ou permissões.'
        })
      }
    }

    fetchUserAndRoles()
  }, [id])

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

    const payload = {
      name,
      email,
      system_role_id: selectedRole.value,
      is_active: isActive ? 1 : 0
    }

    try {
      await api.put(`/users/${id}`, payload)
      setShowSuccessModal(true)
    } catch (err) {
      setErrorModalData({
        isOpen: true,
        title: 'Erro ao atualizar usuário',
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
      <h2 className="text-xl font-bold text-green-700 mb-4">Editar Usuário</h2>

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

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label className="text-gray-700">Usuário ativo</label>
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

      <SuccessModal
        isOpen={showSuccessModal}
        title="Usuário Atualizado!"
        message="As alterações foram salvas com sucesso."
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
