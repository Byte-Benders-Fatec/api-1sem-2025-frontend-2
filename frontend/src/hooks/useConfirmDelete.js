import { useState } from 'react'
import api from '../services/api'

export default function useConfirmDelete({ entity, onSuccess }) {

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [itemId, setItemId] = useState(null)

  const openConfirmModal = (id) => {
    setItemId(id)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    setConfirmOpen(false)
    try {
      await api.delete(`/${entity}/${itemId}`)
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
