import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // On mount: verify session via HttpOnly cookie — no localStorage needed
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await authAPI.me()
        setAuthState({ user: response.data, isAuthenticated: true })
      } catch (err) {
        // 401 means no valid cookie — not an error, just not logged in
        setAuthState({ user: null, isAuthenticated: false })
      } finally {
        setLoading(false)
      }
    }

    initializeUser()
  }, [])

  const login = (userData, redirect = null) => {
    setAuthState({ user: userData, isAuthenticated: true })

    if (redirect) {
      navigate(redirect)
    } else if (userData.roles?.includes('SUPER_ADMIN') || userData.roles?.includes('ADMIN')) {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (_) {
      // ignore errors; cookie cleared server-side
    }
    setAuthState({ user: null, isAuthenticated: false })
    navigate('/login')
  }

  const isAdmin = () =>
    !!(authState.user?.roles?.includes('ADMIN') ||
    authState.user?.roles?.includes('SUPER_ADMIN'))

  const isSuperAdmin = () => !!(authState.user?.roles?.includes('SUPER_ADMIN'))

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      loading,
      login,
      logout,
      isAdmin,
      isSuperAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
