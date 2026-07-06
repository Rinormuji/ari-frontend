import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Phone,
  Search,
  Shield,
  User,
  UserPlus,
  X,
} from "lucide-react";
import logoMark from "../assets/images/ari-mark.svg";
import { useAuth } from "../context/AuthContext";
import { paths } from "../routes/paths";

const navLinks = [
  { name: "Ballina", path: paths.home, icon: Home },
  { name: "Kërko Prona", path: paths.properties, icon: Search },
  { name: "Harta", path: paths.propertiesMap, icon: Map },
  { name: "Rreth Nesh", path: paths.about, icon: Info },
  { name: "Kontakt", path: paths.contact, icon: Phone },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const { user, logout, loading, isAdmin, isSuperAdmin, isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);

  const onAdminPages = location.pathname.startsWith(paths.admin);
  const userIsAdmin = !loading && isAuthenticated && isAdmin();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const renderNavLink = ({ name, path, icon: Icon }, mobile = false) => (
    <Link
      key={name}
      to={path}
      onClick={mobile ? () => setMenuOpen(false) : undefined}
      className={
        mobile
          ? `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
              location.pathname === path ? "bg-[#EFD391]/20 text-[#EFD391]" : "text-[#EFD391] hover:bg-[#EFD391]/10"
            }`
          : `flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
              location.pathname === path ? "bg-[#EFD391]/20 text-[#EFD391]" : "text-[#EFD391] hover:bg-[#EFD391]/10"
            }`
      }
    >
      <Icon size={mobile ? 18 : 15} />
      {name}
    </Link>
  );

  return (
    <nav className={`sticky top-0 z-60 border-b border-white/10 transition-all duration-300 ${scrolled ? "bg-[#0F4638]/95 backdrop-blur-md" : "bg-[#0F4638]"}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to={paths.home} className="flex h-14 w-14 shrink-0 items-center justify-center bg-[#0B3F35] transition-transform duration-300 hover:scale-105">
          <img src={logoMark} alt="Ari Real Estate" className="h-9 w-9" />
        </Link>

        {!onAdminPages && (
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => renderNavLink(link))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {!loading && (
            <>
              {isAuthenticated && userIsAdmin && (
                onAdminPages ? (
                  <Link to={paths.home} className="hidden items-center gap-2 rounded-xl border border-[#EFD391]/30 bg-[#EFD391]/10 px-4 py-2 text-sm font-semibold text-[#EFD391] transition-colors hover:bg-[#EFD391]/20 lg:flex">
                    <Home size={15} /> Ballina
                  </Link>
                ) : (
                  <Link to={paths.admin} className="hidden items-center gap-2 rounded-xl border border-[#EFD391]/30 bg-[#EFD391]/10 px-4 py-2 text-sm font-semibold text-[#EFD391] transition-colors hover:bg-[#EFD391]/20 lg:flex">
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                )
              )}

              {!isAuthenticated ? (
                <div className="hidden items-center gap-3 lg:flex">
                  <Link to={paths.login} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#EFD391] transition-opacity hover:opacity-80">
                    <User size={15} /> Kyçu
                  </Link>
                  <Link to={paths.register} className="inline-flex items-center gap-1.5 rounded-xl bg-[#EFD391] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#D9BF7B]">
                    <UserPlus size={15} /> Regjistrohu
                  </Link>
                </div>
              ) : (
                <div className="relative hidden lg:block" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((open) => !open)}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-[#123E35] px-3 py-2 text-sm font-semibold text-[#EFD391] transition-colors hover:border-[#EFD391]/40"
                  >
                    {isSuperAdmin() ? <Shield size={15} /> : <User size={15} />}
                    <span>{user?.username}</span>
                    <ChevronDown size={13} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 min-w-48 rounded-2xl border border-white/10 bg-[#123E35] p-1 shadow-2xl">
                      {!userIsAdmin && (
                        <>
                          <Link to={paths.profile} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#EFD391] transition-colors hover:bg-[#EFD391]/10">
                            <User size={14} /> Profili
                          </Link>
                          <Link to={paths.myAppointments} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#EFD391] transition-colors hover:bg-[#EFD391]/10">
                            <CalendarDays size={14} /> Takimet e Mia
                          </Link>
                        </>
                      )}
                      {userIsAdmin && (
                        <Link to={paths.profile} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#EFD391] transition-colors hover:bg-[#EFD391]/10">
                          <User size={14} /> Profili
                        </Link>
                      )}
                      <div className="mx-2 my-1 h-px bg-white/10" />
                      <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10">
                        <LogOut size={14} /> Dil
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <button type="button" className="p-1 text-[#EFD391] lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#0F4638] px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {!onAdminPages && navLinks.map((link) => renderNavLink(link, true))}

            {isAuthenticated && userIsAdmin && (
              onAdminPages ? (
                <Link to={paths.home} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#EFD391] hover:bg-[#EFD391]/10">
                  <Home size={18} /> Ballina
                </Link>
              ) : (
                <Link to={paths.admin} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#EFD391] hover:bg-[#EFD391]/10">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              )
            )}

            <div className="my-2 h-px bg-white/10" />

            {!loading && !isAuthenticated ? (
              <>
                <Link to={paths.login} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#EFD391] hover:bg-[#EFD391]/10">
                  <User size={18} /> Kyçu
                </Link>
                <Link to={paths.register} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#EFD391] hover:bg-[#EFD391]/10">
                  <User size={18} /> Regjistrohu
                </Link>
              </>
            ) : !loading && isAuthenticated && (
              <>
                <Link to={paths.profile} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#EFD391] hover:bg-[#EFD391]/10">
                  <User size={18} /> Profili - {user?.username}
                </Link>
                {!userIsAdmin && (
                  <Link to={paths.myAppointments} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#EFD391] hover:bg-[#EFD391]/10">
                    <CalendarDays size={18} /> Takimet e Mia
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10">
                  <LogOut size={18} /> Dil
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
