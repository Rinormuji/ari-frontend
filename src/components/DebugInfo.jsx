import { useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { testBackendConnection, testCORS, testBackendHealth } from '../utils/testConnection'

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
    }
  }, [])

  const testConnection = async () => {
    try {
      setDebugInfo('Testing connection...')
      
      // Test backend health first
      const healthResult = await testBackendHealth()
      console.log('Health test result:', healthResult)
      
      // Test CORS
      const corsResult = await testCORS()
      console.log('CORS test result:', corsResult)
      
      // Test backend connection
      const result = await testBackendConnection()
      console.log('Backend test result:', result)
      
      setDebugInfo(`Health: ${healthResult.success ? 'OK' : 'FAIL'}, CORS: ${corsResult ? 'OK' : 'FAIL'}, Backend: ${result.success ? 'OK' : 'FAIL'}, Status: ${result.status}`)
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Debug Info</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-300"
        >
          ×
        </button>
      </div>
      <div className="mb-2 space-x-2">
        <button 
          onClick={testConnection}
          className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
        >
          Test All
        </button>
        <button 
          onClick={async () => {
            const result = await testBackendHealth()
            setDebugInfo(`Health: ${result.success ? 'OK' : 'FAIL'}, Status: ${result.status}`)
          }}
          className="bg-green-600 text-white px-2 py-1 rounded text-xs"
        >
          Health Check
        </button>
      </div>
      <div className="text-xs break-all">
        {debugInfo || 'Click "Test Connection" to debug'}
      </div>
    </div>
  )
}

export default DebugInfo
