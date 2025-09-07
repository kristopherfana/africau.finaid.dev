import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Download, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FileViewerProps {
  isOpen: boolean
  onClose: () => void
  document: {
    id: string
    name: string
    type: string
    size: string
    originalData?: {
      mimeType: string
      fileSize: number
    }
  } | null
  onDownload: (doc: any) => void
}

export function FileViewer({ isOpen, onClose, document, onDownload }: FileViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStoredToken = (): string | null => {
    try {
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      
      if (cookieToken) {
        try {
          return JSON.parse(decodeURIComponent(cookieToken))
        } catch {
          return decodeURIComponent(cookieToken)
        }
      }
    } catch (e) {
      console.error('Error parsing token from cookie:', e)
    }
    return localStorage.getItem('access_token')
  }

  useEffect(() => {
    if (!isOpen || !document) {
      setFileUrl(null)
      setError(null)
      return
    }

    const loadFile = async () => {
      setLoading(true)
      setError(null)

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'
        const downloadUrl = `${API_BASE_URL}/documents/${document.id}/download`
        
        const token = getStoredToken()
        const headers: HeadersInit = {}
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const response = await fetch(downloadUrl, { headers })
        
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.statusText}`)
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setFileUrl(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file')
        toast.error('Failed to load file for viewing')
      } finally {
        setLoading(false)
      }
    }

    loadFile()

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [isOpen, document])

  const getMimeType = () => {
    if (document?.originalData?.mimeType) {
      return document.originalData.mimeType
    }
    
    // Fallback to file extension
    const extension = document?.name.split('.').pop()?.toLowerCase()
    const mimeTypeMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    
    return extension ? mimeTypeMap[extension] || 'application/octet-stream' : 'application/octet-stream'
  }

  const isViewable = () => {
    const mimeType = getMimeType()
    return mimeType.startsWith('image/') || 
           mimeType === 'application/pdf' || 
           mimeType === 'text/plain'
  }

  const renderFileContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Loading file...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Failed to load file</h3>
          <p className="text-gray-500 text-center">{error}</p>
        </div>
      )
    }

    if (!fileUrl || !document) {
      return null
    }

    const mimeType = getMimeType()

    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center p-4">
          <img 
            src={fileUrl} 
            alt={document.name}
            className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
            onError={() => setError('Failed to load image')}
          />
        </div>
      )
    }

    if (mimeType === 'application/pdf') {
      return (
        <div className="w-full h-[70vh]">
          <iframe
            src={fileUrl}
            className="w-full h-full border rounded-lg"
            title={document.name}
            onError={() => setError('Failed to load PDF')}
          />
        </div>
      )
    }

    if (mimeType === 'text/plain') {
      return (
        <div className="p-4">
          <iframe
            src={fileUrl}
            className="w-full h-96 border rounded-lg bg-white"
            title={document.name}
            onError={() => setError('Failed to load text file')}
          />
        </div>
      )
    }

    // Unsupported file type
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Preview not available</h3>
        <p className="text-gray-500 text-center mb-4">
          This file type cannot be previewed in the browser.
        </p>
        <Button onClick={() => onDownload(document)} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download to view
        </Button>
      </div>
    )
  }

  if (!document) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-1">
            <DialogTitle className="text-lg font-semibold truncate">
              {document.name}
            </DialogTitle>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span>{document.size}</span>
              <span>{getMimeType()}</span>
              {document.originalData?.fileSize && (
                <span>{(document.originalData.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(document)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {renderFileContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}