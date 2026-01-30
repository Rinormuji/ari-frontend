import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <div className="spinner">Loading...</div>

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}
