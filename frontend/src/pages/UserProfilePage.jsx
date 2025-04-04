import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import perfil from '../assets/perfil.png'

export default function UserProfilePage() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const { id, name, email } = response.data
        setUserId(id)
        setName(name)
        setEmail(email)
      } catch (err) {
        setError('Erro ao carregar os dados do usuário.')
      }
    }

    fetchUser()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password && password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    const payload = {
      name,
      email
    }

    if (password) {
      payload.password = password
    }

    try {
      await axios.put(`${API_BASE_URL}/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (photo) {
        
        // Verifica se o tipo de arquivo é permitido
        const allowedTypes = ["image/jpeg", "image/png"];
        if (!allowedTypes.includes(photo.type?.toLowerCase())) {
          setError('Tipo de arquivo inválido. Apenas JPEG e PNG são suportados.');
          return;
        }

        // Verifica se o arquivo excede 16MB
        if (photo.size > 16 * 1024 * 1024) {
          setError('O arquivo excede o limite de 16MB.');
          return;
        }

        const formData = new FormData()
        formData.append('file', photo)               // Bate com multer.single('file')
        formData.append('name', photo.name)
        formData.append('mime_type', photo.type)

        try {
          await axios.put(`${API_BASE_URL}/userphotos/${userId}`, formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data' 
            }
          })
          navigate('/home')
        } catch (err) {
          setError('Erro ao enviar a foto de perfil.')
        }
      }
      setEditMode(false)
    } catch (err) {
      setError('Erro ao atualizar perfil.')
    }
  }

  const handleDeletePhoto = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/userphotos/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Foto de perfil removida com sucesso.');
      setPhoto(null); // zera o upload atual
      // Força recarregamento da imagem (ela vai cair no fallback)
      const cacheBuster = Date.now();
      document.querySelector('img[alt=\"Foto de perfil\"]').src = `${API_BASE_URL}/userphotos/${userId}/view?cb=${cacheBuster}`;
    } catch (err) {
      console.error(err);
      setError('Erro ao remover foto de perfil.');
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-green-700 mb-4">Meu Perfil</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="max-w-md space-y-4">
        <img
          src={`${API_BASE_URL}/userphotos/${userId}/view`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = perfil;
          }}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full border-2 border-white object-cover mb-2"
        />
        {editMode && (
          <>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="text-sm text-gray-700 mb-4"
            />
            <button
              type="button"
              onClick={handleDeletePhoto}
              className="text-red-600 text-sm underline hover:text-red-800"
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
            <p className="border border-gray-300 rounded p-2 bg-gray-100">{email}</p>
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
            <input
              type="email"
              className="w-full border border-gray-300 rounded p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Nova Senha (opcional)</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Confirmar Nova Senha</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded p-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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
    </div>
  )
}
