// Test connection to backend
export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...')
    
    // First test if backend is running
    const healthResponse = await fetch('http://localhost:8080/actuator/health', {
      method: 'GET',
    })
    
    console.log('Health check status:', healthResponse.status)
    
    if (!healthResponse.ok) {
      return {
        success: false,
        error: 'Backend not running or not accessible',
        status: healthResponse.status
      }
    }
    
    // Test with register endpoint
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser123',
        email: 'test@example.com',
        password: 'testpass123'
      })
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    
    const text = await response.text()
    console.log('Response text:', text)
    
    let data
    try {
      data = JSON.parse(text)
      console.log('Parsed response:', data)
    } catch (e) {
      console.log('Could not parse JSON:', e)
    }
    
    return {
      status: response.status,
      data: data || text,
      success: response.ok
    }
  } catch (error) {
    console.error('Connection test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Test CORS
export const testCORS = async () => {
  try {
    console.log('Testing CORS...')
    
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      }
    })
    
    console.log('CORS preflight status:', response.status)
    console.log('CORS headers:', response.headers)
    
    return response.ok
  } catch (error) {
    console.error('CORS test failed:', error)
    return false
  }
}

// Test if backend is running
export const testBackendHealth = async () => {
  try {
    console.log('Testing backend health...')
    
    const response = await fetch('http://localhost:8080/actuator/health', {
      method: 'GET',
    })
    
    console.log('Health check status:', response.status)
    
    if (response.ok) {
      const data = await response.text()
      console.log('Health response:', data)
      return { success: true, status: response.status, data }
    } else {
      return { success: false, status: response.status, error: 'Backend not responding' }
    }
  } catch (error) {
    console.error('Health check failed:', error)
    return { success: false, error: error.message }
  }
}
