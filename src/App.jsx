import { Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import AdminRoute from "./routes/AdminRoute";
import { ToastProvider } from "./context/ToastContext";
import { paths } from "./routes/paths";

import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./admin/layout/AdminLayout";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import AllProperties from "./pages/AllProperties";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Appointment from "./pages/Appointment";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler";

import Dashboard from "./admin/pages/Dashboard";
import PropertiesAdmin from "./admin/pages/PropertiesAdmin";
import AddProperty from "./admin/pages/AddProperty";
import EditProperty from "./admin/pages/EditProperty";
import Users from "./admin/pages/Users";
import AppointmentsAdmin from "./admin/pages/AppointmentsAdmin";

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 },
};

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            path={paths.home}
            element={(
              <motion.div {...fadeIn}>
                <Home />
              </motion.div>
            )}
          />
          <Route path={paths.propertiesMap} element={<Properties />} />
          <Route path={paths.properties} element={<AllProperties />} />
          <Route path={paths.propertyDetail()} element={<PropertyDetail />} />
          <Route path={paths.about} element={<About />} />
          <Route path={paths.contact} element={<Contact />} />
          <Route path={paths.appointment} element={<Appointment />} />
          <Route path={paths.myAppointments} element={<MyAppointments />} />
          <Route path={paths.profile} element={<Profile />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path={paths.login} element={<Login />} />
          <Route path={paths.register} element={<Register />} />
          <Route path={paths.verify} element={<Verify />} />
          <Route path={paths.forgotPassword} element={<ForgotPassword />} />
          <Route path={paths.resetPassword} element={<ResetPassword />} />
          <Route path={paths.oauthRedirect} element={<OAuth2RedirectHandler />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path={paths.admin} element={<Dashboard />} />
            <Route path={paths.adminProperties} element={<PropertiesAdmin />} />
            <Route path={paths.adminPropertyAdd} element={<AddProperty />} />
            <Route path={paths.adminPropertyEdit()} element={<EditProperty />} />
            <Route path={paths.adminUsers} element={<Users />} />
            <Route path={paths.adminAppointments} element={<AppointmentsAdmin />} />
          </Route>
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
