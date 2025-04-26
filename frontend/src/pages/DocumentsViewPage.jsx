import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import api from '../services/api'

export default function DocumentViewPage() {
  const { id } = useParams()
  const [fileUrl, setFileUrl] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${id}/view`, {
          responseType: 'blob'
        })
        const blobUrl = URL.createObjectURL(response.data)
        setFileUrl(blobUrl)
      } catch (err) {
        console.error('Erro ao carregar documento:', err)
        setError('Erro ao carregar documento.')
      }
    }

    fetchDocument()
  }, [id])

  if (error) return <p className="text-red-600">{error}</p>
  if (!fileUrl) return <p>Carregando documento...</p>

  return (
    <div className="h-screen">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={fileUrl}
          defaultScale={1.0}
          renderToolbar={false} // <-- Sem toolbar (oculta impressão/download nativos)
        />
      </Worker>
    </div>
  )
}
