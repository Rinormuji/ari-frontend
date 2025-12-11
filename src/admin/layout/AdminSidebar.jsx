import { Link } from "react-router-dom";
import '../admin.css';
import logo from '../../assets/images/logo.png';

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <img src={logo} alt="Logo ARI Real Estate" className="admin-sidebar-logo" />
      <nav>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/properties">Pronat</Link>
        <Link to="/admin/properties/add">Shto Pronë</Link>
        <Link to="/admin/users">Përdoruesit</Link>
        <Link to="/admin/appointments">Takimet</Link>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
