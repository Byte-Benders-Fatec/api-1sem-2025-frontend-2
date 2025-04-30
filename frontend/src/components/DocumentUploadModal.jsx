import { useState } from 'react'
import api from '../services/api'
import SuccessModal from './SuccessModal'
import ErrorModal from './ErrorModal'

export default function DocumentUploadModal({ isOpen, entityType, entityId, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [errorModalData, setErrorModalData] = useState({ isOpen: false, title: '', message: '' })
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  if (!isOpen) return null

  const entityPaths = {
    project: 'projects',
    activity: 'activities',
    task: 'tasks'
  }
  const path = entityPaths[entityType]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setErrorModalData({
        isOpen: true,
        title: 'Arquivo não selecionado',
        message: 'Por favor, selecione um arquivo para enviar.'
      })
      return
    }

    if (file.size > 16 * 1024 * 1024) {
      setErrorModalData({
        isOpen: true,
        title: 'Arquivo muito grande',
        message: 'O tamanho máximo permitido é de 16MB.'
      })
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)
    formData.append('mime_type', file.type)

    try {
      await api.post(`/${path}/${entityId}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setShowSuccessModal(true)
      setFile(null)
      setFileName('')
      onSuccess()
    } catch (err) {
      console.error(err)
      const apiError = err.response?.data || {}
      setErrorModalData({
        isOpen: true,
        title: apiError.error || 'Erro ao enviar documento',
        message: apiError.details || 'Tente novamente mais tarde.'
      })
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-xl relative">
          <h2 className="text-lg font-bold text-green-700 mb-4">Enviar Documento</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700">Arquivo (Máximo 16 MB) *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={fileName}
                  className="flex-1 border border-gray-300 rounded p-2"
                />
                <label
                  htmlFor="fileInput"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                >
                  Escolher Arquivo
                </label>
              </div>
              <input
                type="file"
                id="fileInput"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files[0]
                  if (selected) {
                    setFile(selected)
                    setFileName(selected.name)
                  }
                }}
              />
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
                Enviar
              </button>
            </div>
          </form>

          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-green-700"
          >
            ✕
          </button>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        title="Documento Enviado!"
        message="O documento foi enviado com sucesso."
        onClose={() => {
          setShowSuccessModal(false)
          onClose()
        }}
      />

      <ErrorModal
        isOpen={errorModalData.isOpen}
        title={errorModalData.title}
        message={errorModalData.message}
        onClose={() => setErrorModalData({ isOpen: false, title: '', message: '' })}
      />
    </>
  )
}
