import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request → ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => Promise.reject(error)
)


// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response ✓ ${response.config.url}`)
    }
    return response
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `API Error ✗ ${error.config?.url}`,
        error.response?.status
      )
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)


// Property API functions
export const propertyAPI = {
  // Get all properties with pagination and filters
  getProperties: (params = {}) => {
    return api.get('/properties', { params })
  },

  // Get single property by ID
  getProperty: (id) => {
    return api.get(`/properties/${id}`)
  },

  // Get property recommendations
  getRecommendations: (id, radiusKm = 5.0) => {
    return api.get(`/properties/${id}/recommendations`, {
      params: { radiusKm }
    })
  },

  // Create property (Admin only)
  createProperty: (propertyData) => {
    return api.post('/properties', propertyData)
  },

  // Update property (Admin only)
  updateProperty: (id, propertyData) => {
    return api.put(`/properties/${id}`, propertyData)
  },

  // Delete property (Admin only)
  deleteProperty: (id) => {
    return api.delete(`/properties/${id}`)
  }
}

// Banesa API functions
export const banesaAPI = {
  // Get all banesa
  getAll: () => {
    return api.get('/banesa')
  },

  // Get single banesa by ID
  getById: (id) => {
    return api.get(`/banesa/${id}`)
  },

  // Create banesa (Admin only)
  create: (banesaData) => {
    return api.post('/banesa', banesaData)
  },

  // Update banesa (Admin only)
  update: (id, banesaData) => {
    return api.put(`/banesa/${id}`, banesaData)
  },

  // Delete banesa (Admin only)
  delete: (id) => {
    return api.delete(`/banesa/${id}`)
  }
}

// Shtepi API functions
export const shtepiAPI = {
  getAll: () => api.get('/shtepi'),
  getById: (id) => api.get(`/shtepi/${id}`),
  create: (data) => api.post('/shtepi', data),
  update: (id, data) => api.put(`/shtepi/${id}`, data),
  delete: (id) => api.delete(`/shtepi/${id}`)
}

// Lokale API functions
export const lokaleAPI = {
  getAll: () => api.get('/lokale'),
  getById: (id) => api.get(`/lokale/${id}`),
  create: (data) => api.post('/lokale', data),
  update: (id, data) => api.put(`/lokale/${id}`, data),
  delete: (id) => api.delete(`/lokale/${id}`)
}

// Toka API functions
export const tokaAPI = {
  getAll: () => api.get('/toka'),
  getById: (id) => api.get(`/toka/${id}`),
  create: (data) => api.post('/toka', data),
  update: (id, data) => api.put(`/toka/${id}`, data),
  delete: (id) => api.delete(`/toka/${id}`)
}

// Auth API functions
export const authAPI = {
  login: (credentials) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth: login request sent')
    }
    return api.post('/auth/login', credentials)
  },

  register: (userData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth: register request sent')
    }
    return api.post('/auth/register', userData)
  },

  logout: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth: logout')
    }
    return api.post('/auth/logout')
  },

  getProfile: () => api.get('/auth/profile')
}


export default api
