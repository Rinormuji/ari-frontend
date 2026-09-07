import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContextValue'
import { paths } from '../routes/paths'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" role="status" aria-label="Duke verifikuar sesionin">
        <div className="w-8 h-8 border-2 border-[#EFD391] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={paths.loginWithRedirect(`${location.pathname}${location.search}`)}
        replace
      />
    )
  }

  return children ?? <Outlet />
}

export default ProtectedRoute
