// src/layouts/PublicLayout.jsx
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Outlet } from "react-router-dom"

export default function PublicLayout() {
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
