import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('exam_token')
    const storedUser = localStorage.getItem('exam_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (newToken, userData) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('exam_token', newToken)
    localStorage.setItem('exam_user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('exam_token')
    localStorage.removeItem('exam_user')
    window.location.href = '/login'
  }

  const updateUser = (userData, newToken) => {
    setUser(userData)
    localStorage.setItem('exam_user', JSON.stringify(userData))
    if (newToken) {
      setToken(newToken)
      localStorage.setItem('exam_token', newToken)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
