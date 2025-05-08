import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import perfil from '../assets/perfil.png'
import ChangePasswordModal from '../components/ChangePasswordModal'
import ChangeEmailModal from '../components/ChangeEmailModal'

export default function UserProfilePage() {
  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(perfil)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me')
        const { id, name, email } = response.data
        setUserId(id)
        setName(name)
        setEmail(email)
      } catch (err) {
        setError('Erro ao carregar os dados do usuário.')
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    let imageUrl

    const fetchPhoto = async () => {
      try {
        const response = await api.get(`/userphotos/${userId}/view`, {
          responseType: 'blob',
        })

        if (response?.status === 204) {
          setPhotoPreview(perfil)
          setHasPhoto(false)
        } else {
          imageUrl = URL.createObjectURL(response.data)
          setPhotoPreview(imageUrl)
          setHasPhoto(true)
        }
      } catch (err) {
        setError('Erro inesperado ao carregar foto de perfil.')
      }
    }

    if (userId) fetchPhoto()

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [userId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const payload = {
      name
    }

    try {
      await api.put(`/users/${userId}`, payload)

      if (photoFile) {
        const allowedTypes = ['image/jpeg', 'image/png']
        if (!allowedTypes.includes(photoFile.type?.toLowerCase())) {
          setError('Tipo de arquivo inválido. Apenas JPEG e PNG são suportados.')
          return
        }

        if (photoFile.size > 16 * 1024 * 1024) {
          setError('O arquivo excede o limite de 16MB.')
          return
        }

        const formData = new FormData()
        formData.append('file', photoFile)
        formData.append('name', photoFile.name)
        formData.append('mime_type', photoFile.type)

        await api.put(`/userphotos/${userId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      if (hasPhoto && photoPreview === perfil) {
        await api.delete(`/userphotos/${userId}`)
      }

      setEditMode(false)
    } catch (err) {
      setError('Erro ao atualizar perfil.')
    }
  }

  const handleDeletePhoto = async () => {
    try {
      setPhotoFile(null)
      setPhotoPreview(perfil)
    } catch (err) {
      setError('Erro ao remover foto de perfil.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Meu Perfil</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="max-w-md space-y-4">
        <img
          src={photoPreview}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full border-2 border-white object-cover mb-2"
        />

        {editMode && (
          <>
            <label htmlFor="fileInput" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer inline-block">
              Escolha uma imagem
            </label>
            <input
              type="file"
              id="fileInput"
              accept="image/jpeg,image/png"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  setPhotoFile(file)
                  setPhotoPreview(URL.createObjectURL(file))
                }
              }}
              className="hidden"
            />

            <label htmlFor="btnRemovePhoto" className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white cursor-pointer inline-block">
              Remover foto de perfil
            </label>
            <button
              type="button"
              id="btnRemovePhoto"
              onClick={handleDeletePhoto}
              className="hidden"
            >
              Remover foto de perfil
            </button>
          </>
        )}
      </div>

      {!editMode ? (
        <div className="max-w-md space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Nome</label>
            <p className="border border-gray-300 rounded p-2 bg-gray-100">{name}</p>
          </div>
          <div>
            <label className="block font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full border border-gray-300 rounded p-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value="********"
              disabled
              className="w-full border border-gray-300 rounded p-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setEditMode(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Editar Perfil
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Nome</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                className="w-full border border-gray-300 rounded p-2 bg-gray-100 cursor-not-allowed"
                value={email}
                disabled
              />
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Alterar
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700">Senha</label>
            <div className="flex gap-2">
              <input
                type="password"
                value="********"
                disabled
                className="w-full border border-gray-300 rounded p-2 bg-gray-100 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Alterar
              </button>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      )}

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <ChangeEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </div>
  )
}
