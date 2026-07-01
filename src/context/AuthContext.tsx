import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../services/api'

interface User {
  id: number
  username: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = api.getToken()
    if (token) {
      api.getMe()
        .then(u => setUser(u))
        .catch(() => api.logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const data = await api.login(username, password)
    setUser(data.user)
  }

  const register = async (username: string, password: string) => {
    const data = await api.register(username, password)
    setUser(data.user)
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}