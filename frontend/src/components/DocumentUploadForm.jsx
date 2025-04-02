import { useState } from 'react'
import axios from 'axios'

export default function DocumentUploadForm({ projectId, onUploadSuccess, onClose }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem('token')

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

    const formData = new FormData()
    formData.append('content', file)
    formData.append('name', file.name)
    formData.append('mime_type', file.type)
    formData.append('project_id', projectId)

    try {
      await axios.post(`${API_BASE_URL}/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
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
