import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Home, Info, Phone, User, LogOut, Search } from 'lucide-react'
import logo from '../assets/images/logo.png'



const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  const navItems = [
    { name: 'Ballina', path: '/', icon: Home },
    { name: 'Kërko Prona', path: '/properties', icon: Search },
    { name: 'Rreth Nesh', path: '/about', icon: Info },
    { name: 'Kontakt', path: '/contact', icon: Phone },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{ backgroundColor: '#000000' }}
      className="shadow-lg sticky top-0 z-50 border-b border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* NAVBAR CONTENT */}
        <div className="flex justify-between items-center h-20">
          {/* LEFT SIDE - Logo + Name */}
          <Link to="/" className="flex items-center space-x-3 group select-none">
          <div
              className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center" 
              style={{ maxWidth: 64, maxHeight: 64 }}
            >
              
              <img
                src={logo}
                alt="Ari Real Estate"
                className="w-full h-full object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {/* <div className="flex flex-col">
              <span
                className="text-xl sm:text-2xl font-bold"
                style={{ color: '#FFAE42' }}
              >
                Ari Real Estate
              </span>
              <span className="text-xs font-medium text-gray-400">
                Premium Properties
              </span>
            </div> */}
          </Link>

          {/* CENTER - Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    color: '#FFAE42',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 no-underline ${
                    isActive ? 'bg-gray-800' : 'hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* RIGHT SIDE - Auth Buttons + Menu Icon */}
          <div className="flex items-center space-x-6">
            {/* Kyçu / Regjistrohu */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-[#FFAE42] font-semibold hover:opacity-80 transition-all duration-300 no-underline"
                  style={{ WebkitTapHighlightColor: 'transparent',marginRight: '15px' }}
                >
                  Kyçu
                </Link>
                <Link
                  to="/register"
                  className="text-[#FFAE42] font-semibold hover:opacity-80 transition-all duration-300 no-underline"
                  style={{ WebkitTapHighlightColor: 'transparent', marginRight: '15px' }}
                >
                  Regjistrohu
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-900 px-4 py-2 rounded-lg mr-[15px]" >
                <User className="w-5 h-5 text-[#FFAE42]" />
                <span className="font-semibold text-[#FFAE42]">{user.username}</span>
                
              </div>
            )}

          
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#FFAE42] ml-6 focus:outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-2 bg-gray-900 rounded-xl border border-gray-800 px-4 py-4 space-y-2"
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-semibold text-base transition-all duration-300 no-underline ${
                    isActive ? 'bg-gray-800' : 'hover:bg-gray-800/60'
                  }`}
                  style={{ color: '#FFAE42', WebkitTapHighlightColor: 'transparent', animationDuration:'0.8' }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {user && (
              <button
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg font-semibold text-base hover:bg-red-900/30 transition-all duration-300 text-red-400 no-underline"
              >
                <LogOut className="w-5 h-5" />
                <span>Dil</span>
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
