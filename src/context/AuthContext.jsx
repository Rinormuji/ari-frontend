import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()
const API_URL = "http://localhost:8080/api/auth"

// Fetch current user from backend
const getUser = async (token) => {
  if (!token) return { ok: false, status: 401 }
  try {
    const res = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return { ok: true, user: res.data }
  } catch (err) {
    return { ok: false, status: err.response?.status || "INTERNAL_ERROR" }
  }
}

// Remove session locally (and optionally call backend logout)
const logoutUserRequest = async () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  return { ok: true }
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Load user from localStorage on mount
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
  
      // Nëse nuk ka fare token, thjesht ndalo loading
      if (!token) {
        setLoading(false);
        return;
      }
  
      try {
        // Provojmë të verifikojmë tokenin me backend
        const response = await getUser(token);
        
        if (response.ok) {
          setAuthState({ user: response.user, isAuthenticated: true });
          localStorage.setItem("user", JSON.stringify(response.user));
        } else {
          // VETËM nëse backend konfirmon që tokeni nuk vlen (psh status 401)
          if (response.status === 401) {
             localStorage.removeItem("token");
             localStorage.removeItem("user");
             setAuthState({ user: null, isAuthenticated: false });
          }
        }
      } catch (err) {
        console.error("Gabim gjatë inicializimit:", err);
        // Nëse ka gabim rrjeti, MOS e fshi tokenin, 
        // sepse ndoshta serveri është thjesht offline për momentin
      } finally {
        setLoading(false);
      }
    };
  
    initializeUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    setAuthState({ user: userData, isAuthenticated: true })

    if (userData.roles?.includes("ROLE_ADMIN")) {
      navigate("/admin")
    } else {
      navigate("/")
    }
  }

  const logout = async () => {
    await logoutUserRequest()
    setAuthState({ user: null, isAuthenticated: false })
    navigate("/login")
  }

  const isAdmin = () => authState.user?.roles?.includes("ROLE_ADMIN") ?? false

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      loading,
      login,
      logout,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
