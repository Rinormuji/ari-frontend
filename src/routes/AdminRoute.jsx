import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0F4638]"><div className="w-8 h-8 border-2 border-[#EFD391] border-t-transparent rounded-full animate-spin" /></div>

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/" replace />

  return <Outlet />
}
