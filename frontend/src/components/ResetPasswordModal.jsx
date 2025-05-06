import { useState } from 'react'
import SuccessModal from './SuccessModal'
import ErrorModal from './ErrorModal'
import VerifyCodeForm from './VerifyCodeForm'
import api from '../services/api'

export default function ResetPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [code, setCode] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorModalData, setErrorModalData] = useState({ isOpen: false, title: '', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await api.post('/auth/start-reset-password', { email })

      if (res.data?.code) {
        setCode(res.data.code)
      }

      setStep(2)
    } catch (err) {
      const apiError = err.response?.data || {}
      setErrorModalData({
        isOpen: true,
        title: apiError.error || 'Erro ao solicitar recuperação',
        message: apiError.details || 'Verifique o e-mail informado ou tente novamente mais tarde.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setCode('')
    setStep(1)
    setIsSubmitting(false)
    setShowSuccessModal(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4 text-green-700">Recuperar Acesso</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-4 text-green-700">Verificar Código</h2>
            <VerifyCodeForm
              email={email}
              type="password_reset"
              inputCode={code}
              onSuccess={() => setShowSuccessModal(true)}
              onError={(err) => {
                setErrorModalData({
                  isOpen: true,
                  title: 'Falha na verificação',
                  message: err?.message || 'Erro ao verificar código. Tente novamente.'
                })
              }}
            />
          </>
        )}

        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-green-600"
          type="button"
          disabled={isSubmitting}
        >
          ✕
        </button>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        title="Solicitação Enviada"
        message="Um e-mail com instruções de recuperação foi enviado. Verifique sua caixa de entrada."
        onClose={handleClose}
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
