import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ProjectLinkForm from '../components/ProjectLinkForm'
import ProjectFinalizationForm from '../components/ProjectFinalizationForm'

export default function ProjectCreatePage() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Planejado')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [createdById, setCreatedById] = useState('')
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1)
  const [createdProjectId, setCreatedProjectId] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await api.get(`/auth/me`)
        setCreatedById(userRes.data.id)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar informações do usuário.')
      }
    }

    fetchUser()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const payload = {
      name,
      code,
      start_date: startDate,
      end_date: endDate,
      ...(description && { description }),
      ...(status && { status }),
      ...(budget && { budget }),
      created_by_id: createdById,
      responsible_user_id: createdById
    }

    try {
      const res = await api.post(`/projects`, payload)
      const newProjectId = res.data.id
      setCreatedProjectId(newProjectId)
      setStep(2)
    } catch (err) {
      console.error(err)
      setError('Erro ao criar projeto.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">
        {step === 1 ? 'Criar Projeto' : 'Vincular Informações ao Projeto'}
      </h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {step === 1 && (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Nome *</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Código *</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Descrição</label>
            <textarea
              className="w-full p-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Status</label>
            <select
              className="w-full p-2 border rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Planejado">Planejado</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700">Data de Início *</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Data de Término *</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Orçamento Total (R$)</label>
            <input
              type="number"
              step="0.01"
              className="w-full p-2 border rounded"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
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
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Prosseguir →
            </button>
          </div>
        </form>
      )}

      {step === 2 && createdProjectId && (
        <ProjectLinkForm
          projectId={createdProjectId}
          onComplete={() => setStep(3)}
          isEditing={false}
        />
      )}

      {step === 3 && createdProjectId && (
        <ProjectFinalizationForm
          projectId={createdProjectId}
          createdById={createdById}
          onComplete={() => navigate('/projects')}
        />
      )}

    </div>
  )
}
