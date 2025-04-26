import { useEffect, useState } from 'react'
import Select from 'react-select'
import api from '../services/api'
import SuccessModal from '../components/SuccessModal'
import ConfirmModal from '../components/ConfirmModal'

export default function ProjectLinkForm({ projectId, onComplete }) {
  const [areas, setAreas] = useState([])
  const [teams, setTeams] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [agencies, setAgencies] = useState([])

  const [addedAreas, setAddedAreas] = useState([])
  const [addedTeams, setAddedTeams] = useState([])
  const [addedInstitutions, setAddedInstitutions] = useState([])
  const [addedAgencies, setAddedAgencies] = useState([])

  const [selectedArea, setSelectedArea] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedInstitution, setSelectedInstitution] = useState(null)
  const [selectedAgency, setSelectedAgency] = useState(null)

  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null, type: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          areaRes,
          teamRes,
          institutionRes,
          agencyRes,
          linkedAreasRes,
          linkedTeamsRes,
          linkedInstitutionsRes,
          linkedAgenciesRes
        ] = await Promise.all([
          api.get(`/projects/${projectId}/available-areas`),
          api.get(`/projects/${projectId}/available-teams`),
          api.get(`/projects/${projectId}/available-institutions`),
          api.get(`/projects/${projectId}/available-agencies`),
          api.get(`/projects/${projectId}/areas`),
          api.get(`/projects/${projectId}/teams`),
          api.get(`/projects/${projectId}/institutions`),
          api.get(`/projects/${projectId}/agencies`)
        ])

        setAreas(areaRes.data)
        setTeams(teamRes.data)
        setInstitutions(institutionRes.data)
        setAgencies(agencyRes.data)

        setAddedAreas(linkedAreasRes.data)
        setAddedTeams(linkedTeamsRes.data)
        setAddedInstitutions(linkedInstitutionsRes.data)
        setAddedAgencies(linkedAgenciesRes.data)

      } catch (err) {
        console.error(err)
        setError('Erro ao carregar dados.')
      }
    }
    fetchData()
  }, [projectId])

  const handleAdd = async (item, type) => {
    if (!item) return

    try {
      if (type === 'area') {
        await api.post(`/projects/${projectId}/areas`, { area_id: item.id })
        setAddedAreas(prev => [...prev, item])
        setAreas(prev => prev.filter(a => a.id !== item.id))
        setSelectedArea(null)
        setSuccessMessage(`Área adicionada com sucesso!`)
      }
      if (type === 'team') {
        await api.post(`/projects/${projectId}/teams`, { team_id: item.id })
        setAddedTeams(prev => [...prev, item])
        setTeams(prev => prev.filter(t => t.id !== item.id))
        setSelectedTeam(null)
        setSuccessMessage(`Time adicionado com sucesso!`)
      }
      if (type === 'institution') {
        await api.post(`/projects/${projectId}/institutions`, { institution_id: item.id })
        setAddedInstitutions(prev => [...prev, item])
        setInstitutions(prev => prev.filter(i => i.id !== item.id))
        setSelectedInstitution(null)
        setSuccessMessage(`Instituição adicionada com sucesso!`)
      }
      if (type === 'agency') {
        await api.post(`/projects/${projectId}/agencies`, { agency_id: item.id })
        setAddedAgencies(prev => [...prev, item])
        setAgencies(prev => prev.filter(a => a.id !== item.id))
        setSelectedAgency(null)
        setSuccessMessage(`Agência de fomento adicionada com sucesso!`)
      }
      setShowSuccessModal(true)
    } catch (err) {
      console.error(err)
      setError('Erro ao adicionar item.')
    }
  }

  const handleConfirmRemove = (item, type) => {
    setConfirmModal({ isOpen: true, item, type })
  }

  const handleRemove = async () => {
    const { item, type } = confirmModal

    try {
      if (type === 'area') {
        await api.delete(`/projects/${projectId}/areas/${item.id}`)
        setAddedAreas(prev => prev.filter(a => a.id !== item.id))
        setAreas(prev => [...prev, item])
      }
      if (type === 'team') {
        await api.delete(`/projects/${projectId}/teams/${item.id}`)
        setAddedTeams(prev => prev.filter(t => t.id !== item.id))
        setTeams(prev => [...prev, item])
      }
      if (type === 'institution') {
        await api.delete(`/projects/${projectId}/institutions/${item.id}`)
        setAddedInstitutions(prev => prev.filter(i => i.id !== item.id))
        setInstitutions(prev => [...prev, item])
      }
      if (type === 'agency') {
        await api.delete(`/projects/${projectId}/agencies/${item.id}`)
        setAddedAgencies(prev => prev.filter(a => a.id !== item.id))
        setAgencies(prev => [...prev, item])
      }

      setConfirmModal({ isOpen: false, item: null, type: '' })
    } catch (err) {
      console.error(err)
      setError('Erro ao remover item.')
    }
  }

  const handleNext = () => {
    if (
      addedAreas.length === 0 ||
      addedTeams.length === 0 ||
      addedInstitutions.length === 0 ||
      addedAgencies.length === 0
    ) {
      setError('Por favor, adicione pelo menos uma área, time, instituição e agência.')
      return
    }
    onComplete()
  }

  return (
    <div className="max-w-3xl space-y-8">
      {error && <p className="text-red-600">{error}</p>}

      {/* Seções */}
      {[
        { label: 'Áreas *', items: areas, added: addedAreas, selected: selectedArea, setSelected: setSelectedArea, type: 'area', labelField: 'name' },
        { label: 'Times *', items: teams, added: addedTeams, selected: selectedTeam, setSelected: setSelectedTeam, type: 'team', labelField: 'name' },
        { label: 'Instituições *', items: institutions, added: addedInstitutions, selected: selectedInstitution, setSelected: setSelectedInstitution, type: 'institution', labelField: 'acronym' },
        { label: 'Agências de Fomento *', items: agencies, added: addedAgencies, selected: selectedAgency, setSelected: setSelectedAgency, type: 'agency', labelField: 'acronym' }
      ].map(({ label, items, added, selected, setSelected, type, labelField }) => (
        <div key={type}>
          <label className="block font-semibold text-gray-700 mb-2">{label}</label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={selected ? { value: selected.id, label: selected[labelField] } : null}
                onChange={(option) => setSelected(items.find(i => i.id === option?.value))}
                options={items.map(item => ({ value: item.id, label: item[labelField] }))}
                placeholder="Selecione..."
                className="w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAdd(selected, type)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Adicionar
            </button>
          </div>
          <ul className="mt-4">
            {added.map(item => (
              <li key={item.id} className="flex justify-between items-center border-b py-1">
                <span>{item[labelField]}</span>
                <button
                  type="button"
                  onClick={() => handleConfirmRemove(item, type)}
                  className="text-red-600 text-sm"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Próxima Etapa
        </button>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        title="Sucesso!"
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Confirmar Remoção"
        message="Tem certeza que deseja remover este vínculo?"
        onConfirm={handleRemove}
        onCancel={() => setConfirmModal({ isOpen: false, item: null, type: '' })}
      />
    </div>
  )
}
