import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./admin/layout/AdminLayout";

// Pages
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Appointment from "./pages/Appointment";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler"

import Dashboard from "./admin/pages/Dashboard";
import PropertiesAdmin from "./admin/pages/PropertiesAdmin";
import AddProperty from "./admin/pages/AddProperty";
import EditProperty from "./admin/pages/EditProperty";
import Users from "./admin/pages/Users";
import AppointmentsAdmin from "./admin/pages/AppointmentsAdmin";

// Optional debug
import DebugInfo from "./components/DebugInfo";

function App() {
  return (
    <Router>
      <Routes>

        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}><Home /></motion.div>} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointment" element={<Appointment />} />
        </Route>

        {/* ==================== AUTH ROUTES ==================== */}
        <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        </Route>

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/properties" element={<PropertiesAdmin />} />
          <Route path="/admin/properties/add" element={<AddProperty />} />
          <Route path="/admin/properties/edit/:id" element={<EditProperty />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/appointments" element={<AppointmentsAdmin />} />
        </Route>

      </Routes>

      <DebugInfo />
    </Router>
  );
}

export default App;
