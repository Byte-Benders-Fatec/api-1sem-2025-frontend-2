import { useState } from 'react'
import api from '../services/api'

export default function DocumentUploadForm({ EntityId, EntityType, onUploadSuccess, onClose }) {

  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
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
    // const entitieId = id || null

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)
    formData.append('mime_type', file.type)

    try {
      // Cria o documento
      const resp = await api.post(`/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const documentId = resp.data.id

      // Vincula o documento à entidade pai (projeto)
      if (EntityType === 'project') {
        await api.post(`/projects/${EntityId}/documents`, {
          document_id: documentId
        })
      }

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

        <div className="flex gap-2">
          {/* Nome do arquivo selecionado */}
          <input
            type="text"
            id="fileName"
            className="flex-1 border border-gray-300 rounded p-2"
            value={fileName}
            readOnly
          />

          {/* Botão customizado */}
          <label 
            htmlFor="fileInput" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer inline-block"
          >
            Escolher Arquivo
          </label>
        </div>

        {/* Input de arquivo real */}
        <input
        type="file"
        id="fileInput"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) {
            setFile(file)
            setFileName(file.name)
            setError(null)
          }
        }}
        className="hidden"
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
