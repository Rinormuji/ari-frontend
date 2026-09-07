import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { paths } from "./routes/paths";

import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoader from "./components/PageLoader";
import ErrorBoundary from "./components/ErrorBoundary";

const Home = lazy(() => import("./pages/Home"));
const Properties = lazy(() => import("./pages/Properties"));
const AllProperties = lazy(() => import("./pages/AllProperties"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Appointment = lazy(() => import("./pages/Appointment"));
const MyAppointments = lazy(() => import("./pages/MyAppointments"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Verify = lazy(() => import("./pages/Verify"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const OAuth2RedirectHandler = lazy(() => import("./components/OAuth2RedirectHandler"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLayout = lazy(() => import("./admin/layout/AdminLayout"));
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const PropertiesAdmin = lazy(() => import("./admin/pages/PropertiesAdmin"));
const AddProperty = lazy(() => import("./admin/pages/AddProperty"));
const EditProperty = lazy(() => import("./admin/pages/EditProperty"));
const Users = lazy(() => import("./admin/pages/Users"));
const AppointmentsAdmin = lazy(() => import("./admin/pages/AppointmentsAdmin"));

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path={paths.home} element={<Home />} />
            <Route path={paths.propertiesMap} element={<Properties />} />
            <Route path={paths.properties} element={<AllProperties />} />
            <Route path={paths.propertyDetail()} element={<PropertyDetail />} />
            <Route path={paths.about} element={<About />} />
            <Route path={paths.contact} element={<Contact />} />

            <Route element={<ProtectedRoute />}>
              <Route path={paths.appointment} element={<Appointment />} />
              <Route path={paths.myAppointments} element={<MyAppointments />} />
              <Route path={paths.profile} element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
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
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
