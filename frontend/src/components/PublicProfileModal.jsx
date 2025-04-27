import Modal from './Modal'
import perfil from '../assets/perfil.png'
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function PublicProfileModal({ isOpen, onClose, userId }) {
  const [user, setUser] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userId) {
          const [userRes, photoRes] = await Promise.all([
            api.get(`/users/${userId}`),
            api.get(`/userphotos/${userId}/view`, { responseType: 'blob' })
          ])

          setUser(userRes.data)

          if (photoRes?.status === 204) {
            setPhotoUrl(perfil)
          } else {
            const imgUrl = URL.createObjectURL(photoRes.data)
            setPhotoUrl(imgUrl)
          }
        }
      } catch (err) {
        console.error('Erro ao carregar perfil público:', err)
        setError('Erro ao carregar perfil.')
      }
    }

    if (isOpen) {
      fetchUserData()
    }
  }, [isOpen, userId])

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Perfil Público">
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="flex flex-col items-center p-4 space-y-4">
          <img
            src={photoUrl || perfil}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full border-2 border-green-600 object-cover"
          />
          <div className="text-center space-y-1">
            <p className="font-bold text-lg">{user.name}</p>
            <p className="text-gray-700">{user.email}</p>
          </div>
        </div>
      )}
    </Modal>
  )
}
