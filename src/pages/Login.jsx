import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import logo2 from '../assets/images/logo2.png'

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { login } = useAuth()
  const [searchParams] = useSearchParams()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await authAPI.login(formData)
      if (response.status === 200) {
        const meRes = await authAPI.me()
        const userData = meRes.data ?? { username: formData.username, roles: response.data.roles ?? [] }
        const redirect = searchParams.get('redirect')
        login(userData, redirect)
      } else {
        setError('Gabim në përgjigjen e serverit')
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Username ose fjalëkalim i gabuar.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const input = "w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl text-sm py-3 px-4 focus:ring-2 focus:ring-[#FFAE42]/50 focus:border-[#FFAE42] outline-none transition"

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-[#0a0a0a] border-r border-white/5 p-12">
        <img src={logo2} alt="Ari Real Estate" className="h-14 w-auto" />
        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">Mirë se vini<br/>në Ari Real Estate</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Eksploroni qindra prona, rezervoni takime dhe gjeni shtëpinë tuaj të ëndrrave.</p>
        </div>
        <p className="text-xs text-white/20">© {new Date().getFullYear()} Ari Real Estate</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <img src={logo2} alt="Ari Real Estate" className="h-12 mx-auto mb-8 lg:hidden" />

          <h1 className="text-2xl font-bold text-white mb-1">Kyçu</h1>
          <p className="text-sm text-white/40 mb-8">Hyni në llogarinë tuaj</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={`${input} pl-10`}
                required
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="Fjalëkalimi"
                value={formData.password}
                onChange={handleChange}
                className={`${input} pl-10 pr-10`}
                required
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-[#FFAE42]/70 hover:text-[#FFAE42] transition-colors">
                Keni harruar fjalëkalimin?
              </Link>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFAE42] hover:bg-[#e09a35] disabled:opacity-50 text-black font-semibold rounded-xl transition-colors text-sm"
            >
              {loading ? 'Duke u kyçur...' : 'Kyçu'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Nuk keni llogari?{' '}
            <Link to="/register" className="text-[#FFAE42] hover:underline font-medium">
              Regjistrohu
            </Link>
          </p>

          <div className="mt-6 pt-4 border-t border-white/5">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft size={13} /> Kthehu te Ballina
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login