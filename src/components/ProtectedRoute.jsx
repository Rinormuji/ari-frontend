import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useContext(AuthContext)

  if (!user) {
    // Nuk je kyçur
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin()) {
    // Nuk je admin
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
