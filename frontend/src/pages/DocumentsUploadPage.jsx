import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function DocumentUploadPage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError('Selecione um arquivo para enviar.')
      return
    }

    // Verifica se o arquivo excede 16MB
    if (file.size > 16 * 1024 * 1024) {
      setError('O arquivo excede o limite de 16MB.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)               // Bate com multer.single('file')
    formData.append('name', file.name)
    formData.append('mime_type', file.type)

    try {
      await axios.post(`${API_BASE_URL}/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      navigate('/documents')
    } catch (err) {
      console.error(err)
      setError('Erro ao enviar documento.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Enviar Documento</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
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
                Enviar
            </button>

        </div>

      </form>
    </div>
  )
}
