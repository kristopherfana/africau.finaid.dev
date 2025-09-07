import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { StudentHeader } from '@/components/layout/student-header'
import { Main } from '@/components/layout/main'
import { PatternWrapper } from '@/components/au-showcase'
import { DocumentUpload } from '@/components/document-upload'
import { documentsAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  File, 
  Download, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Clock
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/documents/')({
  component: DocumentsPage,
})

function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Define the required document types for scholarship applications
  const requiredDocumentTypes = [
    { type: 'TRANSCRIPT', name: 'Academic Transcript', required: true },
    { type: 'RECOMMENDATION', name: 'Recommendation Letter', required: true },
    { type: 'ID', name: 'Identification Document', required: true },
    { type: 'PROOF_OF_INCOME', name: 'Proof of Income', required: false },
    { type: 'OTHER', name: 'Supporting Documents', required: false },
  ]

  // Calculate required documents status based on uploaded documents
  const requiredDocuments = requiredDocumentTypes.map(reqDoc => {
    const uploadedDoc = documents.find(doc => 
      doc.originalData?.documentType === reqDoc.type
    )
    return {
      ...reqDoc,
      uploaded: !!uploadedDoc,
      uploadedDocument: uploadedDoc || null
    }
  })

  // Load documents from backend on component mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const backendDocuments = await documentsAPI.getAll()
      
      // Transform backend data to frontend format
      const transformedDocuments = backendDocuments.map(doc => ({
        id: doc.id,
        name: doc.fileName,
        type: doc.mimeType?.split('/')[1]?.toUpperCase() || 'UNKNOWN',
        size: formatFileSize(doc.fileSize || 0),
        status: 'pending', // New uploads start as pending
        uploadedDate: new Date(doc.uploadedAt).toISOString().split('T')[0],
        required: false,
        originalData: doc // Keep original data for reference
      }))
      
      setDocuments(transformedDocuments)
    } catch (error) {
      console.error('Failed to load documents:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to load documents: ${errorMessage}`)
      // Set empty array on error so UI doesn't show stale data
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const requiredDocs = requiredDocuments.filter(d => d.required)
  const completedRequiredDocs = requiredDocs.filter(d => d.uploaded)
  const completionPercentage = requiredDocs.length > 0 ? (completedRequiredDocs.length / requiredDocs.length) * 100 : 0

  const scrollToUploadSection = () => {
    console.log('Upload New Document button clicked')
    const uploadSection = document.querySelector('[data-upload-section]')
    console.log('Upload section found:', uploadSection)
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      console.log('Scrolled to upload section')
    } else {
      console.log('Upload section not found')
    }
  }

  const handleDownloadAll = async () => {
    if (documents.length === 0) {
      toast.error('No documents to download')
      return
    }

    toast.loading(`Downloading ${documents.length} documents...`, { id: 'download-all' })
    
    let successCount = 0
    let errorCount = 0

    for (const doc of documents) {
      try {
        await handleDownloadDocument(doc, false) // Don't show individual toasts
        successCount++
        // Small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        errorCount++
      }
    }

    if (errorCount === 0) {
      toast.success(`Successfully downloaded ${successCount} documents`, { id: 'download-all' })
    } else {
      toast.warning(`Downloaded ${successCount} documents, ${errorCount} failed`, { id: 'download-all' })
    }
  }

  const handleUploadComplete = (uploadedDocument: any) => {
    // Reload documents from backend to get the latest data
    loadDocuments()
    
    // Show detailed success message
    const successMessage = [
      '✅ Upload successful!',
      `📄 ${uploadedDocument.fileName}`,
      `📊 ${formatFileSize(uploadedDocument.fileSize || 0)}`,
      `📁 ${uploadedDocument.documentType}`
    ].join('\n')
    
    toast.success(successMessage, {
      duration: 4000,
      style: {
        whiteSpace: 'pre-line'
      }
    })
  }

  const handleDeleteDocument = async (docId: string) => {
    const docToDelete = documents.find(d => d.id === docId)
    const confirmMessage = `Are you sure you want to delete "${docToDelete?.name}"?`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      toast.loading('Deleting document...', { id: 'delete' })
      await documentsAPI.delete(docId)
      await loadDocuments() // Reload the list
      toast.success(`"${docToDelete?.name}" deleted successfully`, { id: 'delete' })
    } catch (error) {
      console.error('Failed to delete document:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to delete document: ${errorMessage}`, { id: 'delete' })
    }
  }

  const handleViewDocument = (doc: any) => {
    navigate({ 
      to: '/documents/view/$documentId', 
      params: { documentId: doc.id } 
    })
  }

  const handleDownloadDocument = async (doc: any, showToast: boolean = true) => {
    try {
      if (showToast) {
        toast.loading('Preparing download...', { id: 'download' })
      }
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const downloadUrl = `${API_BASE_URL}/documents/${doc.id}/download`
      
      // Fetch the file with authentication
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

      const response = await fetch(downloadUrl, { headers })
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      // Get the blob and create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      if (showToast) {
        toast.success('Download completed!', { id: 'download' })
      }
    } catch (error) {
      console.error('Failed to download document:', error)
      if (showToast) {
        toast.error(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'download' })
      }
      throw error // Re-throw for handleDownloadAll to catch
    }
  }

  return (
    <>
      <StudentHeader />
      <Main className="p-0">
        <div className="au-showcase">
          {/* Page Header */}
          <div className="au-hero-section">
            <div className="container mx-auto px-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Document Management</h1>
              <p className="text-gray-600">Upload and manage your scholarship application documents</p>
            </div>
          </div>

          {/* Document Upload Stats */}
          <div className="au-section-gray-textured py-8">
            <div className="container mx-auto px-8">
              <div className="au-grid au-grid-3">
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Upload Progress</h3>
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Documents Uploaded</span>
                          <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
                        </div>
                        <div className="au-progress">
                          <div className="au-progress-bar" style={{ width: `${completionPercentage}%` }}></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {completedRequiredDocs.length} of {requiredDocs.length} required documents
                      </p>
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="geometric" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Verification Status</h3>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Verified</span>
                        <span className="au-badge au-badge-success">
                          {documents.filter(d => d.status === 'verified').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pending Review</span>
                        <span className="au-badge au-badge-warning">
                          {documents.filter(d => d.status === 'pending' || !d.status).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Action Required</span>
                        <span className="au-badge au-badge-danger">
                          {requiredDocs.filter(d => !d.uploaded).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="grid" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                      <Upload className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="space-y-3">
                      <button 
                        onClick={scrollToUploadSection}
                        className="w-full au-btn-primary py-2 px-4 rounded-md font-semibold transition-all duration-200 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Upload New Document
                      </button>
                      <button 
                        onClick={handleDownloadAll}
                        disabled={documents.length === 0}
                        className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </button>
                    </div>
                  </div>
                </PatternWrapper>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-8 py-12">
            {/* Required Documents Checklist */}
            <div className="mb-12">
              <div className="au-section-header mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Document Requirements</h2>
                <p className="text-gray-600 mt-2">
                  Track your scholarship application document progress. Required documents must be uploaded for your application to be complete.
                </p>
              </div>
              <div className="au-card">
                <div className="p-6">
                  <div className="space-y-3">
                    {requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          {doc.uploaded ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className={`w-5 h-5 ${doc.required ? 'text-red-300' : 'text-gray-300'}`} />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${doc.uploaded ? 'text-gray-800' : (doc.required ? 'text-gray-700' : 'text-gray-500')}`}>
                                {doc.name}
                              </span>
                              {doc.required && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                  Required
                                </span>
                              )}
                              {!doc.required && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                  Optional
                                </span>
                              )}
                            </div>
                            {doc.uploaded && doc.uploadedDocument && (
                              <p className="text-xs text-gray-500 mt-1">
                                {doc.uploadedDocument.name} • Uploaded {new Date(doc.uploadedDocument.uploadedDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.uploaded && doc.uploadedDocument && (
                            <button 
                              onClick={() => handleViewDocument(doc.uploadedDocument)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View
                            </button>
                          )}
                          {!doc.uploaded && (
                            <button 
                              onClick={scrollToUploadSection}
                              className={`text-sm font-medium ${doc.required ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                              Upload Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Documents */}
            <div>
              <div className="au-section-header mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Uploaded Documents</h2>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600">Loading documents...</span>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No documents uploaded</h3>
                  <p className="text-gray-500">Upload your first document using the form below.</p>
                </div>
              ) : (
              <div className="au-grid au-grid-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="au-card hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FileText className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{doc.name}</h3>
                            <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                            {doc.originalData?.description && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{doc.originalData.description}</p>
                            )}
                          </div>
                        </div>
                        {doc.status === 'verified' && (
                          <span className="au-badge au-badge-success">Verified</span>
                        )}
                        {doc.status === 'pending' && (
                          <span className="au-badge au-badge-warning">Pending</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Uploaded on {new Date(doc.uploadedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewDocument(doc)}
                          className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button 
                          onClick={() => handleDownloadDocument(doc)}
                          className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center text-sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="py-2 px-3 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200 flex items-center justify-center text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {/* Upload New Document Card - Always visible */}
              <div className="mt-8" data-upload-section>
                <DocumentUpload 
                  onUploadComplete={handleUploadComplete}
                  maxFiles={5}
                  maxSizeInMB={10}
                />
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-12 au-card bg-blue-50 border-blue-200">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Document Guidelines</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Accepted formats: PDF, DOC, DOCX, JPG, PNG</li>
                      <li>• Maximum file size: 10MB per document</li>
                      <li>• Ensure all documents are clear and legible</li>
                      <li>• Official transcripts must be sealed or certified</li>
                      <li>• Documents are verified within 2-3 business days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}