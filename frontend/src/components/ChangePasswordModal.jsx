import { useState } from 'react'
import SuccessModal from './SuccessModal'
import ErrorModal from './ErrorModal'
import api from '../services/api'

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorModalData, setErrorModalData] = useState({
    isOpen: false,
    title: '',
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setErrorModalData({
        isOpen: true,
        title: 'Erro de Validação',
        message: 'A nova senha e a confirmação não coincidem.'
      })
      setLoading(false)
      return
    }

    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      })

      setSuccess(true)
    } catch (err) {
      const apiError = err.response?.data || {}
      setErrorModalData({
        isOpen: true,
        title: apiError.error || 'Erro ao alterar senha',
        message: apiError.details || 'Verifique sua senha atual e tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
        <h2 className="text-xl font-bold text-green-700 mb-4">Alterar Senha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual *</label>
            <input
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha *</label>
            <input
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha *</label>
            <input
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded text-white ${
                loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-600 hover:text-green-600"
            >
              ✕
            </button>
          </div>
        </form>
      </div>

      <SuccessModal
        isOpen={success}
        title="Senha Alterada"
        message="Sua senha foi atualizada com sucesso."
        onClose={() => {
          setSuccess(false)
          onClose()
        }}
      />

      <ErrorModal
        isOpen={errorModalData.isOpen}
        title={errorModalData.title}
        message={errorModalData.message}
        onClose={() => setErrorModalData({ isOpen: false, title: '', message: '' })}
      />
    </div>
  )
}
