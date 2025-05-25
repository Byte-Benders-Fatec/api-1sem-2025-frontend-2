import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const AUTH_STRATEGY = import.meta.env.VITE_AUTH_STRATEGY || 'localstorage'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: AUTH_STRATEGY === 'cookie'
})

export const askAssistant = async (prompt) => {
  try {
    const response = await api.post('/ai/ask', { prompt }, { private: false });
    return response.data.response;
  } catch (err) {
    console.error("Erro ao chamar o assistente:", err);
    throw err;
  }
};

// Interceptador para adicionar Authorization condicionalmente
api.interceptors.request.use((config) => {
  const isPrivate = config.private !== false // padrão: true

  if (AUTH_STRATEGY === 'localstorage' && isPrivate) {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
}, (error) => Promise.reject(error))

// Interceptador de respostas
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Limpa token se estiver usando localStorage
        if (AUTH_STRATEGY === 'localstorage') {
          localStorage.removeItem('token')
        }
  
        // Redireciona para login (sem recarregar a página inteira)
        window.location.href = '/login'
      }
  
      return Promise.reject(error)
    }
  )
  
export default api
