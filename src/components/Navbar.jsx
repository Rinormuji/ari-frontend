import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, UserPlus, LogOut, Home, Search, Info, Phone, ChevronDown, LayoutDashboard, CalendarDays, Shield } from "lucide-react";
import logo2 from "../assets/images/logo2.png";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { name: "Ballina", path: "/", icon: Home },
  { name: "Kërko Prona", path: "/properties", icon: Search },
  { name: "Rreth Nesh", path: "/about", icon: Info },
  { name: "Kontakt", path: "/contact", icon: Phone },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const { user, logout, loading, isAdmin, isSuperAdmin, isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);

  const onAdminPages = location.pathname.startsWith("/admin");
  const userIsAdmin = !loading && isAuthenticated && isAdmin();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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

  return (
    <nav
      className={`sticky top-0 z-60 border-b border-white/10 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-md" : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">

        {/* LOGO */}
        <Link to="/" className="shrink-0">
          <img src={logo2} alt="Ari Real Estate" className="h-14 transition-transform duration-300 hover:scale-105" />
        </Link>

        {/* DESKTOP LINKS — hide on admin pages */}
        {!onAdminPages && (
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ name, path, icon: Icon }) => (
              <Link
                key={name}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  location.pathname === path
                    ? "bg-[#FFAE42]/20 text-[#FFAE42]"
                    : "text-[#FFAE42] hover:bg-[#FFAE42]/10"
                }`}
              >
                <Icon size={15} />
                {name}
              </Link>
            ))}
          </div>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-3 ml-auto">
          {!loading && (
            <>
              {/* Admin/Home toggle button */}
              {isAuthenticated && userIsAdmin && (
                onAdminPages ? (
                  <Link
                    to="/"
                    className="hidden lg:flex items-center gap-2 bg-[#FFAE42]/10 border border-[#FFAE42]/30 text-[#FFAE42] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#FFAE42]/20 transition-colors"
                  >
                    <Home size={15} /> Ballina
                  </Link>
                ) : (
                  <Link
                    to="/admin"
                    className="hidden lg:flex items-center gap-2 bg-[#FFAE42]/10 border border-[#FFAE42]/30 text-[#FFAE42] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#FFAE42]/20 transition-colors"
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                )
              )}

              {!isAuthenticated ? (
                <div className="hidden lg:flex items-center gap-3">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-[#FFAE42] font-semibold text-sm hover:opacity-80 transition-opacity">
                    <User size={15} /> Kyçu
                  </Link>
                  <Link to="/register" className="inline-flex items-center gap-1.5 bg-[#FFAE42] text-black font-semibold text-sm px-4 py-2 rounded-xl hover:bg-[#e09a35] transition-colors">
                    <UserPlus size={15} /> Regjistrohu
                  </Link>
                </div>
              ) : (
                <div className="hidden lg:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 bg-[#1f2933] border border-white/10 px-3 py-2 rounded-full text-[#FFAE42] text-sm font-semibold hover:border-[#FFAE42]/40 transition-colors"
                  >
                    {isSuperAdmin() ? <Shield size={15} /> : <User size={15} />}
                    <span>{user?.username}</span>
                    <ChevronDown size={13} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-[#1f2933] border border-white/10 rounded-2xl p-1 min-w-48 shadow-2xl">
                      {!userIsAdmin && (
                        <>
                          <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[#FFAE42] text-sm font-semibold hover:bg-[#FFAE42]/10 transition-colors">
                            <User size={14} /> Profili
                          </Link>
                          <Link to="/my-appointments" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[#FFAE42] text-sm font-semibold hover:bg-[#FFAE42]/10 transition-colors">
                            <CalendarDays size={14} /> Takimet e Mia
                          </Link>
                        </>
                      )}
                      {userIsAdmin && (
                        <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[#FFAE42] text-sm font-semibold hover:bg-[#FFAE42]/10 transition-colors">
                          <User size={14} /> Profili
                        </Link>
                      )}
                      <div className="h-px bg-white/10 mx-2 my-1" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors">
                        <LogOut size={14} /> Dil
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Mobile hamburger */}
          <button className="lg:hidden text-[#FFAE42] p-1" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="lg:hidden bg-black border-t border-white/10 px-4 py-3">
          <div className="flex flex-col gap-1">
            {!onAdminPages && navLinks.map(({ name, path, icon: Icon }) => (
              <Link key={name} to={path} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === path ? "bg-[#FFAE42]/20 text-[#FFAE42]" : "text-[#FFAE42] hover:bg-[#FFAE42]/10"
                }`}
              >
                <Icon size={18} /> {name}
              </Link>
            ))}

            {/* Admin/Home toggle mobile */}
            {isAuthenticated && userIsAdmin && (
              onAdminPages ? (
                <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#FFAE42] hover:bg-[#FFAE42]/10">
                  <Home size={18} /> Ballina
                </Link>
              ) : (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#FFAE42] hover:bg-[#FFAE42]/10">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              )
            )}

            <div className="h-px bg-white/10 my-2" />

            {!loading && !isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#FFAE42] hover:bg-[#FFAE42]/10">
                  <User size={18} /> Kyçu
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#FFAE42] hover:bg-[#FFAE42]/10">
                  <User size={18} /> Regjistrohu
                </Link>
              </>
            ) : !loading && isAuthenticated && (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#FFAE42] hover:bg-[#FFAE42]/10">
                  <User size={18} /> Profili — {user?.username}
                </Link>
                {!userIsAdmin && (
                  <Link to="/my-appointments" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#FFAE42] hover:bg-[#FFAE42]/10">
                    <CalendarDays size={18} /> Takimet e Mia
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 w-full">
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


