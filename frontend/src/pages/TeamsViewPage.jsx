import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function TeamViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [teamUsers, setTeamUsers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [teamRes, usersRes] = await Promise.all([
          api.get(`/teams/${id}`),
          api.get(`/teams/${id}/users`)
        ])
        setName(teamRes.data.name)
        setDescription(teamRes.data.description || '')
        setIsActive(teamRes.data.is_active === 1)
        setTeamUsers(usersRes.data)
      } catch (err) {
        setError('Erro ao carregar time.')
        console.error(err)
      }
    }
    fetchTeam()
  }, [id])

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Visualizar Time</h2>

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
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2 bg-gray-100"
            value={description}
            readOnly
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            disabled
          />
          <label className="text-gray-700">Time ativo</label>
        </div>

        {/* INTEGRANTES DO TIME */}
        <div className="mt-6 space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Integrantes do Time</h3>
          {teamUsers.length === 0 ? (
            <p className="text-gray-500">Nenhum integrante vinculado.</p>
          ) : (
            <ul className="space-y-2">
              {teamUsers.map(user => (
                <li key={user.id} className="flex justify-between border-b py-1">
                  <span>{user.name} ({user.email})</span>
                </li>
              ))}
            </ul>
          )}
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
