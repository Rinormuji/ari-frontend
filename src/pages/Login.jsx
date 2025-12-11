import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Lock, ArrowLeft } from 'lucide-react'
import GoogleIcon from '@mui/icons-material/Google'
import FacebookIcon from '@mui/icons-material/Facebook'
import { authAPI } from '../services/api'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const params = new URLSearchParams(window.location.search);
const token = params.get("token");
if (token) {
  localStorage.setItem("token", token);
  window.location.href = "/"; // ose dashboard
}

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login(formData)
      console.log('Login response:', response.data)
      
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify({
          username: formData.username,
          roles: response.data.roles
        }))
      
        if (response.data.roles.includes("ROLE_ADMIN")) {
          navigate("/admin")
        } else {
          navigate("/")
        }
      
        window.location.reload()
      } else {
        setError("Gabim në përgjigjen e serverit")
      }
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      let errorMessage = 'Gabim në login. Provo përsëri.'
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.token) {
          errorMessage = error.response.data.token
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper-uni">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-card-uni"
      >
        {/* Header */}
        <div className="login-back-home">
          <Link to="/" className="login-back-home-link">
          <ArrowLeft className="login-back-home-icon" />
            Kthehu te Ballina
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">Kyçu në llogarinë tënde</h2>
          <p className="text-gray-600">Hyni në llogarinë tuaj për të vazhduar</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="login-input-wrapper-uni">
              <User className="login-input-icon-left" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="login-input-uni"
                required
              />
            </div>

            {/* Password */}
            <div className="login-input-wrapper-uni">
              <Lock className="login-input-icon-left" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="login-input-uni"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-btn-uni"
            >
              {loading ? 'Duke u kyçur...' : 'Kyçu'}
            </button>

            {/* Forgot Password */}
            <div className="login-forgot-password-uni text-center mt-2">
              <Link to="/reset-password">Keni harruar fjalëkalimin?</Link>
            </div>

            {/* Social Login */}
<div className="login-divider-uni">OR</div>
<div className="login-socials-uni">
  <button
    type="button"
    className="login-social-btn-uni"
    onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
  >
    <GoogleIcon fontSize="small" /> Google
  </button>

  <button
    type="button"
    className="login-social-btn-uni"
    onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/facebook"}
  >
    <FacebookIcon fontSize="small" /> Facebook
  </button>
</div>


            {/* Register Link */}
            <div className="login-register-link-uni text-center mt-4">
              Nuk keni llogari? <Link to="/register" className="text-blue-600 font-semibold">Regjistrohuni këtu</Link>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
