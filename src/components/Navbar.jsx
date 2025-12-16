import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Home, Search, Info, Phone, Settings } from "lucide-react";
import logo2 from "../assets/images/logo2.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Ballina", path: "/", icon: Home },
    { name: "Kërko Prona", path: "/properties", icon: Search },
    { name: "Rreth Nesh", path: "/about", icon: Info },
    { name: "Kontakt", path: "/contact", icon: Phone },
  ];

  return (
    <nav className={`ari-user-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="ari-user-navbar-inner">

        {/* LOGO */}
        <Link to="/" className="ari-user-navbar-logo">
          <img src={logo2} alt="Ari Real Estate" />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="ari-user-navbar-links">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`ari-user-nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* RIGHT SIDE */}
        <div className="ari-user-navbar-auth">
          {!user ? (
            <>
              <Link to="/login" className="ari-user-auth-link">Kyçu</Link>
              <Link to="/register" className="ari-user-auth-link">Regjistrohu</Link>
            </>
          ) : (
            <div
              className="ari-user-badge"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <User size={16} />
              <span>{user.username}</span>

              {/* DROPDOWN */}
              {dropdownOpen && (
                <div className="ari-user-dropdown">
                  <Link to="/profile" className="ari-user-dropdown-link">
                    <User size={14} /> Profili
                  </Link>
                  {/* <Link to="/settings" className="ari-user-dropdown-link">
                    <Settings size={14} /> Settings
                  </Link> */}
                  <button onClick={handleLogout} className="ari-user-dropdown-link logout">
                    <LogOut size={14} /> Dil
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="ari-user-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="ari-user-mobile-menu">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`ari-user-mobile-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}

          {user && (
            <button className="ari-user-logout" onClick={handleLogout}>
              <LogOut size={18} /> Dil
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
