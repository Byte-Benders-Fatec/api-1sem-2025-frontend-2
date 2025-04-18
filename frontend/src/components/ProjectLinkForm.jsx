import { useEffect, useState } from 'react'
import api from '../services/api'
import DocumentUploadForm from './DocumentUploadForm'

export default function ProjectLinkForm({ projectId, onComplete }) {
  const [areas, setAreas] = useState([])
  const [teams, setTeams] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [agencies, setAgencies] = useState([])

  const [selectedArea, setSelectedArea] = useState('')
  const [addedAreas, setAddedAreas] = useState([])

  const [selectedTeam, setSelectedTeam] = useState('')
  const [addedTeams, setAddedTeams] = useState([])

  const [selectedInstitution, setSelectedInstitution] = useState('')
  const [addedInstitutions, setAddedInstitutions] = useState([])

  const [selectedAgency, setSelectedAgency] = useState('')
  const [addedAgencies, setAddedAgencies] = useState([])

  const [error, setError] = useState(null)
  const [showDocUpload, setShowDocUpload] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areaRes, teamRes, institutionRes, agencyRes] = await Promise.all([
          api.get(`/projects/${projectId}/available-areas`),
          api.get(`/projects/${projectId}/available-teams`),
          api.get(`/projects/${projectId}/available-institutions`),
          api.get(`/projects/${projectId}/available-agencies`)
        ])
        setAreas(areaRes.data)
        setTeams(teamRes.data)
        setInstitutions(institutionRes.data)
        setAgencies(agencyRes.data)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar dados.')
      }
    }
    fetchData()
  }, [projectId])

  const addItem = (item, added, setAdded, max = 5) => {
    if (!item || added.find(i => i.id === item.id)) return
    if (added.length >= max) return
    setAdded([...added, item])
  }

  const removeItem = (id, added, setAdded) => {
    setAdded(added.filter(i => i.id !== id))
  }

  const handleSubmit = async () => {
    if (
      addedAreas.length === 0 ||
      addedTeams.length === 0 ||
      addedInstitutions.length === 0 ||
      addedAgencies.length === 0
    ) {
      setError('Por favor, adicione pelo menos uma área, time, instituição e agência.')
      return
    }

    try {
      await Promise.all([
        ...addedAreas.map(a => api.post(`/projects/${projectId}/areas`, { area_id: a.id })),
        ...addedTeams.map(t => api.post(`/projects/${projectId}/teams`, { team_id: t.id })),
        ...addedInstitutions.map(i => api.post(`/projects/${projectId}/institutions`, { institution_id: i.id })),
        ...addedAgencies.map(a => api.post(`/projects/${projectId}/agencies`, { agency_id: a.id }))
      ])
      onComplete()
    } catch (err) {
      console.error(err)
      setError('Erro ao vincular dados ao projeto.')
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {error && <p className="text-red-600">{error}</p>}

      {/* ÁREAS */}
      <div>
        <label className="block font-semibold text-gray-700">Áreas *</label>
        <div className="flex items-center gap-4">
          <select
            value={selectedArea?.id || ''}
            onChange={(e) => {
              const selected = areas.find(a => a.id === e.target.value)
              setSelectedArea(selected || '')
            }}
            className="flex-1 p-2 border rounded"
          >
            <option value="">Selecione uma área</option>
            {areas
                .filter(area => !addedAreas.find(a => a.id === area.id))
                .map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => addItem(selectedArea, addedAreas, setAddedAreas)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Adicionar
          </button>
        </div>
        <ul className="mt-2">
          {addedAreas.map(area => (
            <li key={area.id} className="flex justify-between items-center border-b py-1">
              <span>{area.name}</span>
              <button onClick={() => removeItem(area.id, addedAreas, setAddedAreas)} className="text-red-600 text-sm">Remover</button>
            </li>
          ))}
        </ul>
      </div>

      {/* TIMES */}
      <div>
        <label className="block font-semibold text-gray-700">Times *</label>
        <div className="flex items-center gap-4">
          <select
            value={selectedTeam?.id || ''}
            onChange={(e) => {
              const selected = teams.find(t => t.id === e.target.value)
              setSelectedTeam(selected || '')
            }}
            className="flex-1 p-2 border rounded"
          >
            <option value="">Selecione um time</option>
            {teams
                .filter(team => !addedTeams.find(t => t.id === team.id))
                .map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => addItem(selectedTeam, addedTeams, setAddedTeams)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Adicionar
          </button>
        </div>
        <ul className="mt-2">
          {addedTeams.map(team => (
            <li key={team.id} className="flex justify-between items-center border-b py-1">
              <span>{team.name}</span>
              <button onClick={() => removeItem(team.id, addedTeams, setAddedTeams)} className="text-red-600 text-sm">Remover</button>
            </li>
          ))}
        </ul>
      </div>

      {/* INSTITUIÇÕES */}
      <div>
        <label className="block font-semibold text-gray-700">Instituições *</label>
        <div className="flex items-center gap-4">
          <select
            value={selectedInstitution?.id || ''}
            onChange={(e) => {
              const selected = institutions.find(i => i.id === e.target.value)
              setSelectedInstitution(selected || '')
            }}
            className="flex-1 p-2 border rounded"
          >
            <option value="">Selecione uma instituição</option>
            {institutions
                .filter(inst => !addedInstitutions.find(i => i.id === inst.id))
                .map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.acronym} - {inst.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => addItem(selectedInstitution, addedInstitutions, setAddedInstitutions)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Adicionar
          </button>
        </div>
        <ul className="mt-2">
          {addedInstitutions.map(inst => (
            <li key={inst.id} className="flex justify-between items-center border-b py-1">
              <span>{inst.acronym} - {inst.name}</span>
              <button onClick={() => removeItem(inst.id, addedInstitutions, setAddedInstitutions)} className="text-red-600 text-sm">Remover</button>
            </li>
          ))}
        </ul>
      </div>

      {/* AGÊNCIAS */}
      <div>
        <label className="block font-semibold text-gray-700">Agências de Fomento *</label>
        <div className="flex items-center gap-4">
          <select
            value={selectedAgency?.id || ''}
            onChange={(e) => {
              const selected = agencies.find(a => a.id === e.target.value)
              setSelectedAgency(selected || '')
            }}
            className="flex-1 p-2 border rounded"
          >
            <option value="">Selecione uma agência</option>
            {agencies
                .filter(agency => !addedAgencies.find(a => a.id === agency.id))
                .map(agency => (
                    <option key={agency.id} value={agency.id}>{agency.acronym} - {agency.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => addItem(selectedAgency, addedAgencies, setAddedAgencies)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Adicionar
          </button>
        </div>
        <ul className="mt-2">
          {addedAgencies.map(agency => (
            <li key={agency.id} className="flex justify-between items-center border-b py-1">
              <span>{agency.acronym} - {agency.name}</span>
              <button onClick={() => removeItem(agency.id, addedAgencies, setAddedAgencies)} className="text-red-600 text-sm">Remover</button>
            </li>
          ))}
        </ul>
      </div>

      {/* DOCUMENTOS */}
      <div className="mt-6">
        <button
          onClick={() => setShowDocUpload(!showDocUpload)}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          {showDocUpload ? 'Ocultar Upload de Documento' : 'Adicionar Documento (Opcional)'}
        </button>
        {showDocUpload && (
          <div className="mt-4">
            <DocumentUploadForm
              EntityId={projectId}
              EntityType="project"
              onUploadSuccess={() => alert('Documento adicionado com sucesso!')}
              onClose={() => setShowDocUpload(false)}
            />
          </div>
        )}
      </div>

      {/* BOTÃO FINAL */}
      <div className="flex justify-end mt-8 gap-4">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Finalizar Cadastro
        </button>
      </div>
    </div>
  )
}
