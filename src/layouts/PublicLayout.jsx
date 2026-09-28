// src/layouts/PublicLayout.jsx
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/authContextValue"
import { paths } from "../routes/paths"

export default function PublicLayout() {
  const { user, isAuthenticated, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (!loading && isAuthenticated && !isAdmin() && !user?.preferencesCompleted && location.pathname !== paths.preferences) {
    return <Navigate to={paths.preferences} replace />
  }
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Outlet /> {/* Outlet vendos faqen e përzgjedhur nga Routes */}
      </main>
      <Footer />
    </>
  )
}
