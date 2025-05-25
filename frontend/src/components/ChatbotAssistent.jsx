import { useState } from 'react'
import { askAssistant } from '../services/api'
import { MessageCircle } from 'lucide-react'

export default function ChatbotAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([]) 
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggleChat = () => setIsOpen(!isOpen)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) return


    const newMessages = [...messages, { role: 'user', text: trimmedPrompt }]
    setMessages(newMessages)
    setPrompt('')
    setLoading(true)
    setError(null)

    try {
      const responseText = await askAssistant(trimmedPrompt)

     
      setMessages((prev) => [...prev, { role: 'assistant', text: responseText }])
    } catch (err) {
      setError('Erro ao obter resposta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleChat}
        className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="mt-2 w-80 h-[500px] bg-white shadow-xl rounded-lg p-4 border border-gray-300 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-green-700">Assistente IA</h2>
            <button onClick={toggleChat} className="text-sm text-gray-500 hover:text-red-500">
              Fechar
            </button>
          </div>


          <div className="flex-1 overflow-y-auto mb-2 space-y-2 pr-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-sm ${
                  msg.role === 'user'
                    ? 'bg-green-100 self-end text-right'
                    : 'bg-gray-100 self-start text-left'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-sm text-gray-500 italic">Pensando...</div>}
          </div>

    
          <form onSubmit={handleSubmit} className="mt-auto">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite sua pergunta..."
              className="w-full border rounded p-2 h-20 resize-none"
              disabled={loading}
            />
            <button
              type="submit"
              className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 w-full"
              disabled={loading}
            >
              Enviar
            </button>
          </form>

          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </div>
      )}
    </div>
  )
}
