import { useState, useEffect } from 'react'
import api from '../services/api'

export default function useAuth() {
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const token = localStorage.getItem('token')

    if (!token) {
      setAuthenticated(false)
      setLoading(false)
      return
    }

    api.get('/auth/validate'    
    )
    .then((response) => {
      setAuthenticated(true)
      setUser(response.data.user)
    })
    .catch(() => {
      setAuthenticated(false)
      localStorage.removeItem('token')
    })
    .finally(() => {
      setLoading(false)
    })
  }, [])

  return {
    authenticated,
    user,
    loading
  }
}
