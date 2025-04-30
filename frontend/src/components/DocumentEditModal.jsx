import { useEffect, useState } from 'react'
import api from '../services/api'
import SuccessModal from './SuccessModal'
import ErrorModal from './ErrorModal'

export default function DocumentEditModal({ isOpen, documentId, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [errorModalData, setErrorModalData] = useState({ isOpen: false, title: '', message: '' })
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    if (isOpen && documentId) {
      const fetchDocument = async () => {
        try {
          const res = await api.get(`/documents/${documentId}`)
          setName(res.data.name)
          setIsActive(res.data.is_active)
        } catch (err) {
          setErrorModalData({
            isOpen: true,
            title: 'Erro ao carregar documento',
            message: 'Não foi possível carregar as informações do documento.'
          })
        }
      }
      fetchDocument()
    }
  }, [isOpen, documentId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/documents/${documentId}`, {
        name,
        is_active: isActive ? 1 : 0
      })
      setShowSuccessModal(true)
    } catch (err) {
      const apiError = err.response?.data || {}
      setErrorModalData({
        isOpen: true,
        title: apiError.error || 'Erro ao atualizar documento',
        message: apiError.details || 'Tente novamente mais tarde.'
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg relative">
        <h2 className="text-xl font-bold text-green-700 mb-4">Editar Documento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label className="text-gray-700">Documento Ativo</label>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-green-600"
        >
          ✕
        </button>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        title="Documento Atualizado!"
        message="As alterações foram salvas com sucesso."
        onClose={() => {
          setShowSuccessModal(false)
          onClose()
          onSuccess()
        }}
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
