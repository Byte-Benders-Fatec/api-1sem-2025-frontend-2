import { useState } from 'react'
import api from '../services/api'

export default function DocumentUploadForm({ id, onUploadSuccess, onClose }) {

  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError('Selecione um arquivo para enviar.')
      return
    }

    if (file.size > 16 * 1024 * 1024) {
      setError('O arquivo excede o limite de 16MB.')
      return
    }

    // ATENÇÃO: Placeholder, futuramente fazer a conexão entre a entidade e o documento
    const entitieId = id || null

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)
    formData.append('mime_type', file.type)

    try {
      await api.post(`/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (onUploadSuccess) onUploadSuccess()
      if (onClose) onClose()
    } catch (err) {
      console.error(err)
      setError('Erro ao enviar documento.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <label className="block font-medium text-gray-700">
          Arquivo (Máximo 16 MB) *
        </label>
        <input
          type="file"
          className="w-full p-2 border rounded"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
      </div>

      <div className="flex justify-end space-x-4">
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
  )
}
