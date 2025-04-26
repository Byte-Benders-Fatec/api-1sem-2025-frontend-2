import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import ProjectLinkForm from '../components/ProjectLinkForm'
import ProjectFinalizationForm from '../components/ProjectFinalizationForm'
import SuccessModal from '../components/SuccessModal'

export default function ProjectsEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Planejado')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [createdById, setCreatedById] = useState('')
  const [error, setError] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`)
        const project = response.data
        setName(project.name)
        setCode(project.code)
        setDescription(project.description || '')
        setStatus(project.status || 'Planejado')
        setStartDate(project.start_date?.split('T')[0] || '')
        setEndDate(project.end_date?.split('T')[0] || '')
        setBudget(project.budget || '')
        setIsActive(project.is_active)
        setCreatedById(project.created_by_id)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar projeto.')
      }
    }

    fetchProject()
  }, [id])

  const handleUpdateProject = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      await api.put(`/projects/${id}`, {
        name,
        code,
        description,
        status,
        start_date: startDate,
        end_date: endDate,
        budget,
        is_active: isActive
      })
      setShowSuccessModal(true)
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar projeto.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">
        {step === 1 ? 'Editar Projeto' : 'Vincular Informações ao Projeto'}
      </h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {step === 1 && (
        <form onSubmit={handleUpdateProject} className="max-w-xl space-y-4">
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label className="text-gray-700">Projeto Ativo</label>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ← Voltar
            </button>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Salvar Alterações
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Prosseguir →
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 2 && id && (
        <ProjectLinkForm 
          projectId={id} 
          onComplete={() => setStep(3)}
          onBack={() => setStep(1)}
          isEditing={true}
        />
      )}

      {step === 3 && id && createdById && (
        <ProjectFinalizationForm
          projectId={id}
          createdById={createdById}
          onComplete={() => navigate('/projects')}
          onBack={() => setStep(2)}
          isEditing={true}
        />
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        title="Alterações Salvas!"
        message="As informações do projeto foram atualizadas com sucesso."
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  )
}
