import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  className?: string
  onUploadComplete?: (document: any) => void
  maxFiles?: number
  acceptedTypes?: string[]
  maxSizeInMB?: number
}

interface UploadedFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  errorMessage?: string
}

const DOCUMENT_TYPES = [
  { value: 'TRANSCRIPT', label: 'Academic Transcript' },
  { value: 'RECOMMENDATION', label: 'Recommendation Letter' },
  { value: 'ID', label: 'Identification Document' },
  { value: 'PROOF_OF_INCOME', label: 'Proof of Income' },
  { value: 'OTHER', label: 'Other Document' },
]

export function DocumentUpload({
  className,
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  maxSizeInMB = 10,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState('OTHER')
  const [description, setDescription] = useState('')

  const validateFile = (file: File): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} not allowed. Accepted types: ${acceptedTypes.join(', ')}`
    }
    
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeInMB}MB limit`
    }
    
    return null
  }

  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: UploadedFile[] = []

    for (const file of fileArray) {
      if (files.length + validFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        break
      }

      const validationError = validateFile(file)
      if (validationError) {
        toast.error(validationError)
        continue
      }

      validFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending'
      })
    }

    setFiles(prev => [...prev, ...validFiles])
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    if (event.dataTransfer.files) {
      addFiles(event.dataTransfer.files)
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const uploadFile = async (uploadedFile: UploadedFile) => {
    setFiles(prev => 
      prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      )
    )

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile.file)

      // Using query parameters as per the backend API
      const params: Record<string, string> = {
        documentType: selectedDocumentType
      }
      if (description.trim()) {
        params.description = description.trim()
      }

      // Build the URL with query parameters
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const url = new URL(`${API_BASE_URL}/documents/upload`)
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })

      // Get token for authorization
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

      const token = getStoredToken()
      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }))
        throw new Error(error.message || `Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      setFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'success', progress: 100 }
            : f
        )
      )

      toast.success(`${uploadedFile.file.name} uploaded successfully`)
      onUploadComplete?.(result)

      // Remove successful uploads after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.id !== uploadedFile.id))
      }, 2000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error', errorMessage }
            : f
        )
      )
      toast.error(`Failed to upload ${uploadedFile.file.name}: ${errorMessage}`)
    }
  }

  const uploadAllFiles = () => {
    files
      .filter(f => f.status === 'pending')
      .forEach(uploadFile)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Document Type</label>
          <select
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {DOCUMENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the document"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Drop Zone */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="sr-only"
              id="document-upload"
              disabled={files.length >= maxFiles}
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Documents</h3>
              <p className="text-sm text-gray-600">
                Drag and drop files here, or{' '}
                <label
                  htmlFor="document-upload"
                  className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                >
                  click to browse
                </label>
              </p>
              <p className="text-xs text-gray-500">
                Supports: {acceptedTypes.join(', ')} • Max {maxSizeInMB}MB per file • Up to {maxFiles} files
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(uploadedFile => (
            <div
              key={uploadedFile.id}
              className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{uploadedFile.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {uploadedFile.status === 'pending' && (
                  <span className="text-xs text-gray-500">Ready to upload</span>
                )}
                {uploadedFile.status === 'uploading' && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-xs text-blue-600">Uploading...</span>
                  </div>
                )}
                {uploadedFile.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {uploadedFile.status === 'error' && (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-600">
                      {uploadedFile.errorMessage}
                    </span>
                  </div>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(uploadedFile.id)}
                  disabled={uploadedFile.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Upload Actions */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={files.some(f => f.status === 'uploading')}
            >
              Clear All
            </Button>
            <Button
              onClick={uploadAllFiles}
              disabled={
                files.length === 0 || 
                !files.some(f => f.status === 'pending') ||
                files.some(f => f.status === 'uploading')
              }
            >
              Upload {files.filter(f => f.status === 'pending').length} File(s)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}