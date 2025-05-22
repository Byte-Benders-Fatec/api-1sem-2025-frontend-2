import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import SuccessModal from '../components/SuccessModal'
import ErrorModal from '../components/ErrorModal'

export default function ProjectActivityCreatePage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [allocatedBudget, setAllocatedBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [createdById, setCreatedById] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorModalData, setErrorModalData] = useState({ isOpen: false, title: '', message: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, userRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/auth/me`)
        ])
        setProject(projectRes.data)
        setCreatedById(userRes.data.id)
      } catch (err) {
        console.error(err)
        setErrorModalData({
          isOpen: true,
          title: 'Erro ao carregar dados iniciais',
          message: 'Tente novamente mais tarde.'
        })
      }
    }

    fetchData()
  }, [projectId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      project_id: projectId,
      name,
      start_date: startDate,
      end_date: endDate,
      created_by_id: createdById,
      ...(description && { description }),
      ...(status && { status }),
      ...(allocatedBudget && { allocated_budget: allocatedBudget })
    }

    try {
      await api.post(`/activities`, payload)
      setShowSuccessModal(true)
    } catch (err) {
      console.error(err)
      const apiError = err.response?.data || {}
      setErrorModalData({
        isOpen: true,
        title: apiError.error || 'Erro ao criar atividade',
        message: apiError.details || 'Tente novamente mais tarde.'
      })
    }
  }

  if (!project) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Criar Atividade</h2>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Projeto *</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-100"
            value={`${project.code} - ${project.name}`}
            disabled
          />
        </div>

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
            <option value="">Selecione o status</option>
            <option value="Não iniciada">Não iniciada</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Orçamento da Atividade (R$)</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={allocatedBudget}
            onChange={(e) => setAllocatedBudget(e.target.value)}
          />
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
        title="Atividade Criada!"
        message="A atividade foi criada com sucesso."
        onClose={() => navigate(`/projects/${projectId}/activities`)}
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
