import { Link } from "react-router-dom";
import '../admin.css';
import logo from '../../assets/images/logo.png';
import { FaHome } from "react-icons/fa";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <Link to="/">
        <img
          src={logo}
          alt="Logo ARI Real Estate"
          className="admin-sidebar-logo"
        />
      </Link>

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
