import { useEffect, useState } from 'react'
import { authAPI } from '@/lib/api'

export function PrismaConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [dbInfo, setDbInfo] = useState<string>('')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test backend API connection
        const response = await fetch(import.meta.env.VITE_API_URL || 'http://localhost:3000')
        if (response.ok || response.status === 404) { // 404 is ok, means server is running
          setConnectionStatus('connected')
          setDbInfo('Backend API is accessible')
        } else {
          setConnectionStatus('error')
          setDbInfo('Backend API not responding')
        }
      } catch (error) {
        setConnectionStatus('error')
        setDbInfo('Cannot connect to backend API')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="p-4 rounded-lg border">
      <h3 className="font-semibold mb-2">Backend API Connection Status</h3>
      {connectionStatus === 'checking' && (
        <p className="text-muted-foreground">Checking connection...</p>
      )}
      {connectionStatus === 'connected' && (
        <div>
          <p className="text-green-600">✓ Successfully connected to backend</p>
          <p className="text-sm text-muted-foreground mt-1">{dbInfo}</p>
        </div>
      )}
      {connectionStatus === 'error' && (
        <div>
          <p className="text-red-600">✗ Connection error</p>
          <p className="text-sm text-muted-foreground mt-1">{dbInfo}</p>
        </div>
      )}
    </div>
  )
}