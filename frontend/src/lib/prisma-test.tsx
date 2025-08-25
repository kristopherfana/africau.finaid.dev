import { useEffect, useState } from 'react'

export function PrismaConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [dbInfo, setDbInfo] = useState<string>('')

  useEffect(() => {
    // Since Prisma runs on the server and DATABASE_URL is not exposed to browser,
    // we'll check using the Supabase URL which is available
    const checkConnection = () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      
      if (supabaseUrl) {
        // Extract the project ref from Supabase URL
        const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
        if (projectRef) {
          setDbInfo(`PostgreSQL database: ${projectRef}`)
          setConnectionStatus('connected')
        } else {
          setConnectionStatus('connected')
          setDbInfo('Prisma configured with Supabase PostgreSQL')
        }
      } else {
        setConnectionStatus('error')
        setDbInfo('Supabase environment variables not configured')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="p-4 rounded-lg border">
      <h3 className="font-semibold mb-2">Prisma Database Connection Status</h3>
      {connectionStatus === 'checking' && (
        <p className="text-muted-foreground">Checking configuration...</p>
      )}
      {connectionStatus === 'connected' && (
        <div>
          <p className="text-green-600">✓ Prisma configured for PostgreSQL</p>
          <p className="text-sm text-muted-foreground mt-1">{dbInfo}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Full connection test requires a backend API
          </p>
        </div>
      )}
      {connectionStatus === 'error' && (
        <div>
          <p className="text-red-600">✗ Configuration error</p>
          <p className="text-sm text-muted-foreground mt-1">{dbInfo}</p>
        </div>
      )}
    </div>
  )
}