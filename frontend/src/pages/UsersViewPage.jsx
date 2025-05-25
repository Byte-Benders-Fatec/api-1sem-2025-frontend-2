import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Select from 'react-select'

export default function UserViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [systemRoles, setSystemRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [roleDescription, setRoleDescription] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserAndRoles = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get('/systemroles')
        ])

        const user = userRes.data
        setName(user.name)
        setEmail(user.email)
        setIsActive(user.is_active === 1)
        setSystemRoles(rolesRes.data)

        const role = rolesRes.data.find(r => r.id === user.system_role_id)
        if (role) {
          setSelectedRole({ value: role.id, label: role.name })
          setRoleDescription(role.description)
        }
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar usuário ou permissões.')
      }
    }

    fetchUserAndRoles()
  }, [id])

  const roleOptions = systemRoles.map(role => ({
    value: role.id,
    label: role.name
  }))

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Visualizar Usuário</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="max-w-md space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Nome</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 bg-gray-100"
            value={name}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded p-2 bg-gray-100"
            value={email}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Papel do Sistema</label>
          <Select
            value={selectedRole}
            options={roleOptions}
            isDisabled
            className="w-full"
          />
        </div>

        {roleDescription && (
          <div className="text-gray-600 text-sm p-2 border rounded bg-gray-50">
            <strong>Descrição:</strong> {roleDescription}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            disabled
          />
          <label className="text-gray-700">Usuário ativo</label>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
