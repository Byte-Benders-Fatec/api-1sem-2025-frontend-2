import { useState } from 'react'
import axios from 'axios'

export default function useConfirmDelete({ entity, token, onSuccess }) {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [itemId, setItemId] = useState(null)

  const openConfirmModal = (id) => {
    setItemId(id)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    setConfirmOpen(false)
    try {
      await axios.delete(`${API_BASE_URL}/${entity}/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onSuccess()
    } catch (err) {
      console.error(err)
      alert(`Erro ao excluir ${entity}.`)
    }
  }

  return {
    confirmOpen,
    openConfirmModal,
    closeConfirmModal: () => setConfirmOpen(false),
    handleDelete
  }
}
