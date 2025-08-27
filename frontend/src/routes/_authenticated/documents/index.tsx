import { createFileRoute } from '@tanstack/react-router'
import { StudentHeader } from '@/components/layout/student-header'
import { Main } from '@/components/layout/main'
import { PatternWrapper } from '@/components/au-showcase'
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
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/documents/')({
  component: DocumentsPage,
})

function DocumentsPage() {
  const [documents] = useState([
    {
      id: 1,
      name: 'Academic Transcript',
      type: 'PDF',
      size: '2.3 MB',
      status: 'verified',
      uploadedDate: '2025-01-15',
      required: true,
    },
    {
      id: 2,
      name: 'Recommendation Letter - Prof. Smith',
      type: 'PDF',
      size: '1.1 MB',
      status: 'verified',
      uploadedDate: '2025-01-10',
      required: true,
    },
    {
      id: 3,
      name: 'Personal Statement',
      type: 'DOCX',
      size: '156 KB',
      status: 'pending',
      uploadedDate: '2025-01-20',
      required: true,
    },
    {
      id: 4,
      name: 'CV/Resume',
      type: 'PDF',
      size: '345 KB',
      status: 'verified',
      uploadedDate: '2025-01-05',
      required: false,
    },
  ])

  const requiredDocuments = [
    { name: 'Academic Transcript', uploaded: true },
    { name: 'Recommendation Letter', uploaded: true },
    { name: 'Personal Statement', uploaded: true },
    { name: 'Proof of Enrollment', uploaded: false },
    { name: 'Financial Statement', uploaded: false },
  ]

  const completionPercentage = (requiredDocuments.filter(d => d.uploaded).length / requiredDocuments.length) * 100

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
                        {requiredDocuments.filter(d => d.uploaded).length} of {requiredDocuments.length} required documents
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
                        <span className="au-badge au-badge-success">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pending Review</span>
                        <span className="au-badge au-badge-warning">1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Action Required</span>
                        <span className="au-badge au-badge-danger">0</span>
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
                      <button className="w-full au-btn-primary py-2 px-4 rounded-md font-semibold transition-all duration-200 flex items-center justify-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload New Document
                      </button>
                      <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center">
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
                <h2 className="text-2xl font-bold text-gray-800">Required Documents</h2>
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
                            <XCircle className="w-5 h-5 text-gray-300" />
                          )}
                          <span className={`font-medium ${doc.uploaded ? 'text-gray-800' : 'text-gray-400'}`}>
                            {doc.name}
                          </span>
                        </div>
                        {!doc.uploaded && (
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Upload Now
                          </button>
                        )}
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
                        <button className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center text-sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center text-sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                        <button className="py-2 px-3 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200 flex items-center justify-center text-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Upload New Document Card */}
                <div className="au-card border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                  <div className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <h3 className="font-semibold text-gray-700 mb-2">Upload New Document</h3>
                    <p className="text-sm text-gray-500 text-center mb-4">
                      Drag and drop or click to browse
                    </p>
                    <button className="au-btn-secondary px-6 py-2 text-sm rounded-md font-semibold transition-all duration-200">
                      Select File
                    </button>
                  </div>
                </div>
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