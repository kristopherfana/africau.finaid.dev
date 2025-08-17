import { useEffect, useState } from 'react'

import { supabase } from './supabase'

export function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase
          .from('_test_connection')
          .select('*')
          .limit(1)
        
        if (error && (error.code === '42P01' || error.message.includes('_test_connection'))) {
          setConnectionStatus('connected')
        } else if (error) {
          setConnectionStatus('error')
          setErrorMessage(error.message)
        } else {
          setConnectionStatus('connected')
        }
      } catch (err) {
        setConnectionStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="p-4 rounded-lg border">
      <h3 className="font-semibold mb-2">Supabase Connection Status</h3>
      {connectionStatus === 'checking' && (
        <p className="text-muted-foreground">Checking connection...</p>
      )}
      {connectionStatus === 'connected' && (
        <p className="text-green-600">✓ Successfully connected to Supabase</p>
      )}
      {connectionStatus === 'error' && (
        <div>
          <p className="text-red-600">✗ Connection error</p>
          <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
        </div>
      )}
    </div>
  )
}