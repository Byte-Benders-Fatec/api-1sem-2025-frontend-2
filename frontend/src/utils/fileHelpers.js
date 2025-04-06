import api from '../services/api'

export async function downloadDocument(doc) {
  try {
    const response = await api.get(`/documents/${doc.id}/download`, {
      responseType: 'blob'
    })

    const blobUrl = URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = doc.name || 'documento.pdf'
    link.click()
    URL.revokeObjectURL(blobUrl)
  } catch (err) {
    console.error('Erro ao baixar documento:', err)
  }
}

export async function viewDocument(doc) {
  try {
    const response = await api.get(`/documents/${doc.id}/view`, {
      responseType: 'blob'
    })

    const blobUrl = URL.createObjectURL(response.data)
    window.open(blobUrl, '_blank')
  } catch (err) {
    console.error('Erro ao visualizar documento:', err)
  }
}
