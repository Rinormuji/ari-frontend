import { Link, useLocation } from "react-router-dom";
import { X, LayoutDashboard, Building2, PlusSquare, Users, CalendarCheck } from "lucide-react";
import logo from '../../assets/images/logo.png';

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Pronat", path: "/admin/properties", icon: Building2 },
  { label: "Shto Pronë", path: "/admin/properties/add", icon: PlusSquare },
  { label: "Përdoruesit", path: "/admin/users", icon: Users },
  { label: "Takimet", path: "/admin/appointments", icon: CalendarCheck },
];

function AdminSidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 shrink-0
        bg-[#111111] border-r border-white/10 flex flex-col
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <Link to="/" onClick={onClose}>
          <img src={logo} alt="Ari Real Estate" className="h-10 w-auto" />
        </Link>
        <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${active
                  ? "bg-[#FFAE42]/15 text-[#FFAE42]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"}
              `}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/30 text-center">Ari Admin Panel</p>
      </div>
    </aside>
  );
}

export default AdminSidebar;

