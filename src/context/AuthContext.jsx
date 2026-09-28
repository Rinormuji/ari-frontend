import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { AuthContext } from './authContextValue'

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
        setAuthState(response.status === 204 || !response.data
          ? { user: null, isAuthenticated: false }
          : { user: response.data, isAuthenticated: true })
      } catch {
        // 401 means no valid cookie — not an error, just not logged in
        setAuthState({ user: null, isAuthenticated: false })
      } finally {
        setLoading(false)
      }
    }

    initializeUser()
  }, [])

  const login = useCallback((userData, redirect = null) => {
    setAuthState({ user: userData, isAuthenticated: true })

    if (redirect) {
      navigate(redirect)
    } else if (userData.roles?.includes('SUPER_ADMIN') || userData.roles?.includes('ADMIN')) {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }, [navigate])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // ignore errors; cookie cleared server-side
    }
    setAuthState({ user: null, isAuthenticated: false })
    navigate('/login')
  }, [navigate])

  const refreshUser = useCallback(async () => {
    const response = await authAPI.me()
    if (response.data) setAuthState({ user: response.data, isAuthenticated: true })
    return response.data
  }, [])

  const isAdmin = useCallback(() =>
    !!(authState.user?.roles?.includes('ADMIN') ||
    authState.user?.roles?.includes('SUPER_ADMIN')), [authState.user])

  const isSuperAdmin = useCallback(
    () => !!authState.user?.roles?.includes('SUPER_ADMIN'),
    [authState.user],
  )

  const value = useMemo(() => ({
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      loading,
      login,
      logout,
      refreshUser,
      isAdmin,
      isSuperAdmin
    }), [authState, isAdmin, isSuperAdmin, loading, login, logout, refreshUser])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
