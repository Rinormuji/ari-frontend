import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function AdminTopbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 md:px-6 bg-[#111111] border-b border-white/10 shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-white/60 hover:text-white p-1"
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/70">{user?.username ?? "Admin"}</span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Dil</span>
        </button>
      </div>
    </header>
  );
}

export default AdminTopbar;

