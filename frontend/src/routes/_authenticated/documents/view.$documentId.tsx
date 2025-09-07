import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize,
  FileText,
  AlertCircle,
  Loader2,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { documentsAPI } from '@/lib/api'

export const Route = createFileRoute('/_authenticated/documents/view/$documentId')({
  component: DocumentViewer,
})

function DocumentViewer() {
  const { documentId } = Route.useParams()
  const navigate = useNavigate()
  
  const [document, setDocument] = useState<any>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

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

  const loadDocument = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get document metadata
      const docData = await documentsAPI.getById(documentId)
      setDocument(docData)

      // Load file for viewing
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'
      const downloadUrl = `${API_BASE_URL}/documents/${documentId}/download`
      
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
      setError(err instanceof Error ? err.message : 'Failed to load document')
      toast.error('Failed to load document for viewing')
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    loadDocument()

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [loadDocument])

  // Keyboard shortcuts for images only
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!document || !getMimeType().startsWith('image/')) return

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
          e.preventDefault()
          handleZoomOut()
          break
        case '0':
          e.preventDefault()
          handleReset()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleRotate()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          handleFullscreen()
          break
        case 'Escape':
          if (fullscreen) {
            handleFullscreen()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          setPanX(prev => prev + 50)
          break
        case 'ArrowRight':
          e.preventDefault()
          setPanX(prev => prev - 50)
          break
        case 'ArrowUp':
          e.preventDefault()
          setPanY(prev => prev + 50)
          break
        case 'ArrowDown':
          e.preventDefault()
          setPanY(prev => prev - 50)
          break
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (!document || !getMimeType().startsWith('image/')) return
      
      if (e.ctrlKey) {
        e.preventDefault()
        if (e.deltaY < 0) {
          handleZoomIn()
        } else {
          handleZoomOut()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [document, fullscreen])

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!getMimeType().startsWith('image/')) return
    // Only enable drag if zoomed in or if specifically clicking on the image
    if (zoom > 100) {
      e.preventDefault()
      setIsDragging(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 100) return
    
    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y
    
    setPanX(prev => prev + deltaX)
    setPanY(prev => prev + deltaY)
    
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false)
      window.addEventListener('mouseup', handleGlobalMouseUp)
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging])

  const handleDownload = async () => {
    if (!document) return
    
    try {
      toast.loading('Preparing download...', { id: 'download' })
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'
      const downloadUrl = `${API_BASE_URL}/documents/${documentId}/download`
      
      const token = getStoredToken()
      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(downloadUrl, { headers })
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = document.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Download completed!', { id: 'download' })
    } catch (error) {
      toast.error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'download' })
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(100)
    setRotation(0)
    setPanX(0)
    setPanY(0)
  }
  const handleFullscreen = () => {
    if (!fullscreen) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setFullscreen(!fullscreen)
  }

  const getMimeType = () => {
    if (document?.mimeType) {
      return document.mimeType
    }
    
    const extension = document?.fileName?.split('.').pop()?.toLowerCase()
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

  const renderFileContent = () => {
    if (!fileUrl || !document) return null

    const mimeType = getMimeType()

    if (mimeType.startsWith('image/')) {
      return (
        <div className="w-full h-full overflow-auto relative">
          <div 
            className="flex items-center justify-center min-h-full relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ 
              cursor: isDragging ? 'grabbing' : (zoom > 100 ? 'grab' : 'default'),
              minWidth: '100%',
              minHeight: '100%'
            }}
          >
            <img 
              src={fileUrl} 
              alt={document.fileName}
              className="max-w-none transition-transform duration-200 ease-in-out select-none"
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
              onError={() => setError('Failed to load image')}
              draggable={false}
            />
          </div>
        </div>
      )
    }

    if (mimeType === 'application/pdf') {
      return (
        <div className="w-full h-full overflow-auto">
          <iframe
            src={`${fileUrl}#zoom=${zoom}`}
            className="w-full h-full border-0"
            title={document.fileName}
            onError={() => setError('Failed to load PDF')}
          />
        </div>
      )
    }

    if (mimeType === 'text/plain') {
      return (
        <div className="w-full h-full p-4 overflow-auto">
          <iframe
            src={fileUrl}
            className="w-full h-full border-0 bg-white rounded"
            title={document.fileName}
            style={{ fontSize: `${zoom}%` }}
            onError={() => setError('Failed to load text file')}
          />
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileText className="w-24 h-24 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Preview not available</h2>
        <p className="text-gray-500 text-center mb-6 max-w-md">
          This file type cannot be previewed in the browser. Please download the file to view it.
        </p>
        <Button onClick={handleDownload} size="lg">
          <Download className="w-5 h-5 mr-2" />
          Download File
        </Button>
      </div>
    )
  }

  const isImage = document && getMimeType().startsWith('image/')
  const isPDF = document && getMimeType() === 'application/pdf'

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mr-3" />
          <span className="text-lg text-gray-700">Loading document...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Failed to load document</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => navigate({ to: '/documents' })} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/documents' })}
            className="text-gray-700 hover:bg-gray-100 hover:text-red-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="font-semibold truncate max-w-md text-gray-800">
              {document?.fileName || 'Document'}
            </h1>
            <div className="text-sm text-gray-600">
              {document && (
                <>
                  {Math.round((document.fileSize || 0) / 1024)} KB • {getMimeType()}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls for Images Only */}
          {isImage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
                className="text-gray-700 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm px-2 min-w-[4rem] text-center text-gray-700 font-medium">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 300}
                className="text-gray-700 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="text-gray-700 hover:bg-red-50 hover:text-red-700"
                title="Rotate (R)"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-gray-700 hover:bg-red-50 hover:text-red-700"
                title="Reset (0)"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="text-gray-700 hover:bg-red-50 hover:text-red-700"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </>
          )}

          <Button
            onClick={handleDownload}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50">
        {renderFileContent()}
      </div>
    </div>
  )
}