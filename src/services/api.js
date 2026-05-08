import axios from 'axios'


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`API Request → ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error)
)


// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`API Response ✓ ${response.config.url}`)
    }
    return response
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error(
        `API Error ✗ ${error.config?.url}`,
        error.response?.status
      )
    }

    if (error.response?.status === 401) {
      // Don't auto-redirect for the session-check call — AuthContext handles that
      const url = error.config?.url || ''
      if (!url.includes('/auth/me') && !url.includes('/auth/login')) {
        window.location.href = '/login'
      }
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
  },
    
  updatePropertyByType: (type, id, propertyData) => {
  let url = '';
  switch (type.toUpperCase()) {
    case 'BANESA': url = `/banesa/${id}`; break;
    case 'SHTEPI': url = `/shtepi/${id}`; break;
    case 'LOKALE': url = `/lokale/${id}`; break;
    case 'TOKA': url = `/toka/${id}`; break;
    default: throw new Error('Lloji i pronës nuk është valid!');
  }
  return api.put(url, propertyData);
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
// Në api.js
export const adminAPI = {
  getStats: () => api.get("/users/stats"),
};


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
export const usersAPI = {
  // GET /api/users?page=...&size=...&search=...
  getUsers: (params = {}) => api.get('/users', { params }),

  // PUT /api/users/:id/email?email=...
  updateEmail: (id, email) => api.put(`/users/${id}/email`, null, { params: { email } }),

  // PUT /api/users/:id/roles
  updateRoles: (id, roles) => api.put(`/users/${id}/roles`, roles),

  // PUT /api/users/:id/toggle-status
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),

  // DELETE /api/users/:id
  deleteUser: (id) => api.delete(`/users/${id}`),

  // POST /api/users/register-admin (SuperAdmin only)
  registerAdmin: (data) => api.post('/users/register-admin', data),

  // POST /api/users/register-user (SuperAdmin only)
  registerUser: (data) => api.post('/users/register-user', data),
}

// Auth API functions
export const authAPI = {
  login: (credentials) => {
    if (import.meta.env.DEV) {
      console.log('Auth: login request sent')
    }
    return api.post('/auth/login', credentials)
  },

  register: (userData) => {
    if (import.meta.env.DEV) {
      console.log('Auth: register request sent')
    }
    return api.post('/auth/register', userData)
  },

  logout: () => {
    if (import.meta.env.DEV) {
      console.log('Auth: logout')
    }
    return api.post('/auth/logout')
  },

  me: () => api.get('/auth/me'),

  getProfile: () => api.get('/auth/profile')
}

// Appointment API
export const appointmentAPI = {
  // User: create appointment
  create: (propertyId, date) => api.post('/appointments', { propertyId, date }),

  // User: get own appointments
  getMy: () => api.get('/appointments/my'),

  // Admin: get all appointments
  getAll: (params = {}) => api.get('/appointments', { params }),

  // Admin: approve
  approve: (id) => api.put(`/appointments/${id}/approve`),

  // Admin: reject
  reject: (id) => api.put(`/appointments/${id}/reject`),
}

export { api }
export default api
