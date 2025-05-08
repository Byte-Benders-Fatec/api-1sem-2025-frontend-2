import { useEffect, useState } from 'react'
import SuccessModal from './SuccessModal'
import ErrorModal from './ErrorModal'
import VerifyCodeForm from './VerifyCodeForm'
import api from '../services/api'

export default function ChangeEmailModal({ isOpen, onClose }) {
  const [newEmail, setNewEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [step, setStep] = useState(1)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorModalData, setErrorModalData] = useState({
    isOpen: false,
    title: '',
    message: ''
  })

  useEffect(() => {
    if (isOpen) {
      localStorage.removeItem('twofa_email_change_token')
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (newEmail !== confirmEmail) {
      setErrorModalData({
        isOpen: true,
        title: 'Erro de Validação',
        message: 'O e-mail e a confirmação não coincidem.'
      })
      setLoading(false)
      return
    }

    try {
      const res = await api.post('/auth/start-change-email', {
        new_email: newEmail
      })

      if (res.data?.code) setCode(res.data.code)
      if (res.data?.twofa_email_change_token) {
        localStorage.setItem('twofa_email_change_token', res.data.twofa_email_change_token)
      }

      setStep(2)
    } catch (err) {
      const apiError = err.response?.data || {}
      setErrorModalData({
        isOpen: true,
        title: apiError.error || 'Erro ao solicitar alteração',
        message: apiError.details || 'Tente novamente mais tarde.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNewEmail('')
    setConfirmEmail('')
    setCode('')
    setStep(1)
    setLoading(false)
    localStorage.removeItem('twofa_email_change_token')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-green-700 mb-4">Alterar E-mail</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Novo E-mail *</label>
                <input
                  type="email"
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Novo E-mail *</label>
                <input
                  type="email"
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded text-white ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <VerifyCodeForm
            email={newEmail}
            type="email_change"
            inputCode={code}
            titleContext="Alteração de E-mail"
            extraPayload={{ new_email: newEmail }}
            onSuccess={() => {
              localStorage.removeItem('twofa_email_change_token')
              setSuccess(true)
            }}
            onError={(err) => {
              setErrorModalData({
                isOpen: true,
                title: 'Erro na verificação',
                message: err?.message || 'Erro ao verificar o código.'
              })
            }}
          />
        )}

        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-green-600"
        >
          ✕
        </button>
      </div>

      <SuccessModal
        isOpen={success}
        title="E-mail Atualizado"
        message="Seu e-mail foi alterado com sucesso."
        onClose={() => {
          setSuccess(false)
          handleClose()
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
