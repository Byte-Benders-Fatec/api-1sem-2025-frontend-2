import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Modal from '../components/Modal'
import DocumentUploadForm from '../components/DocumentUploadForm'

export default function ProjectEditPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [fundingAgencyId, setFundingAgencyId] = useState('')
  const [agencies, setAgencies] = useState([])
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState(null)

  const [documents, setDocuments] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, agenciesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/agencies`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        const p = projectRes.data
        setName(p.name)
        setCode(p.code)
        setDescription(p.description || '')
        setStatus(p.status || '')
        setStartDate(p.start_date?.split('T')[0] || '')
        setEndDate(p.end_date?.split('T')[0] || '')
        setBudget(p.budget || '')
        setFundingAgencyId(p.funding_agency_id || '')
        setAgencies(agenciesRes.data)
        setIsActive(p.is_active === 1)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar projeto ou agências.')
      }
    }

    fetchData()
    refreshDocuments()
  }, [id, token])

  const refreshDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents?project_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDocuments(res.data)
    } catch (err) {
      console.error('Erro ao buscar documentos:', err)
    }
  }

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
      ...(fundingAgencyId && { funding_agency_id: fundingAgencyId }),
      is_active: isActive ? 1 : 0
    }

    try {
      await axios.put(`${API_BASE_URL}/projects/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      navigate('/projects')
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar projeto.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Editar Projeto</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Nome *</label>
          <input type="text" className="w-full p-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Código *</label>
          <input type="text" className="w-full p-2 border rounded" value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea className="w-full p-2 border rounded" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Status</label>
          <select
            className="w-full p-2 border rounded"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Selecione o status</option>
            <option value="Planejado">Planejado</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Suspenso">Suspenso</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Data de Início *</label>
          <input type="date" className="w-full p-2 border rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Data de Término *</label>
          <input type="date" className="w-full p-2 border rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Orçamento (R$)</label>
          <input type="number" step="0.01" className="w-full p-2 border rounded" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Agência de Fomento</label>
          <select
            className="w-full p-2 border rounded"
            value={fundingAgencyId}
            onChange={(e) => setFundingAgencyId(e.target.value)}
          >
            <option value="">Selecione uma agência (opcional)</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.cnpj} - {agency.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label className="text-gray-700">Projeto ativo</label>
        </div>

        <div className="flex space-x-12 mt-6">
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

      {/* Documentos vinculados */}
      <div className="mt-10 border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-green-700">Documentos do Projeto</h3>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            + Adicionar Documento
          </button>
        </div>

        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{doc.name}</span>
              <a
                href={`${API_BASE_URL}/documents/${doc.id}/download`}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Adicionar Documento">
        <DocumentUploadForm
          projectId={id}
          onClose={() => setShowModal(false)}
          onUploadSuccess={refreshDocuments}
        />
      </Modal>
    </div>
  )
}
