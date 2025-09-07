import { useState } from 'react'
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, Calendar, BookOpen } from 'lucide-react'
import { useUserApplications } from '@/hooks/use-applications'
import { ApplicationStatus } from '@/types/application'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'

export function UserApplicationsList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('all')
  
  // TODO: Get actual user ID from auth context
  const userId = 'current-user-id'
  
  const statusFilter = activeTab === 'all' ? undefined : activeTab as ApplicationStatus
  const { data: applications, isLoading, error } = useUserApplications(userId, { status: statusFilter })

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.DRAFT:
        return <FileText className="h-4 w-4" />
      case ApplicationStatus.SUBMITTED:
        return <Clock className="h-4 w-4" />
      case ApplicationStatus.UNDER_REVIEW:
        return <AlertCircle className="h-4 w-4" />
      case ApplicationStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />
      case ApplicationStatus.REJECTED:
        return <XCircle className="h-4 w-4" />
      case ApplicationStatus.WITHDRAWN:
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusBadgeClass = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.DRAFT:
        return 'au-badge au-badge-neutral'
      case ApplicationStatus.SUBMITTED:
        return 'au-badge au-badge-info'
      case ApplicationStatus.UNDER_REVIEW:
        return 'au-badge au-badge-warning'
      case ApplicationStatus.APPROVED:
        return 'au-badge au-badge-success'
      case ApplicationStatus.REJECTED:
        return 'au-badge au-badge-danger'
      case ApplicationStatus.WITHDRAWN:
        return 'au-badge au-badge-secondary'
      default:
        return 'au-badge au-badge-neutral'
    }
  }

  const handleNewApplication = () => {
    navigate({ to: '/scholarships' })
  }

  const handleViewApplication = (id: string) => {
    console.log('Navigating to application:', id)
    console.log('Target path:', `/applications/${id}`)
    navigate({ to: `/applications/${id}` })
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading applications...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading applications: {error.message}</div>
  }

  return (
    <div className="space-y-8">
      {/* Filters Section */}
      <div className="au-card">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Filter Applications</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                activeTab === 'all' 
                  ? 'au-btn-primary' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All Applications
            </button>
            <button
              onClick={() => setActiveTab(ApplicationStatus.DRAFT)}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                activeTab === ApplicationStatus.DRAFT 
                  ? 'au-btn-primary' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setActiveTab(ApplicationStatus.SUBMITTED)}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                activeTab === ApplicationStatus.SUBMITTED 
                  ? 'au-btn-primary' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Submitted
            </button>
            <button
              onClick={() => setActiveTab(ApplicationStatus.UNDER_REVIEW)}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                activeTab === ApplicationStatus.UNDER_REVIEW 
                  ? 'au-btn-primary' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Under Review
            </button>
            <button
              onClick={() => setActiveTab(ApplicationStatus.APPROVED)}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                activeTab === ApplicationStatus.APPROVED 
                  ? 'au-btn-primary' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setActiveTab(ApplicationStatus.REJECTED)}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                activeTab === ApplicationStatus.REJECTED 
                  ? 'au-btn-primary' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          {applications?.length ? `${applications.length} Applications Found` : 'No Applications Found'}
        </h2>
        <button 
          onClick={handleNewApplication}
          className="au-btn-primary px-6 py-3 rounded-md font-semibold transition-all duration-200 flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </button>
      </div>

      {/* Application Cards */}
      <div className="au-grid au-grid-2">
        {applications && applications.length > 0 ? (
          applications.map((application) => (
            <div 
              key={application.id}
              className="scholarship-card cursor-pointer h-full"
              onClick={() => handleViewApplication(application.id)}
            >
              <div className="scholarship-card-header">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-white line-clamp-2">
                      {application.scholarshipName}
                    </h3>
                    <p className="text-white/80 text-sm">
                      Application ID: {application.id}
                    </p>
                  </div>
                  <BookOpen className="w-6 h-6 text-white opacity-80" />
                </div>
                <span className={`${getStatusBadgeClass(application.status)} flex items-center`}>
                  {getStatusIcon(application.status)}
                  <span className="ml-1">{application.status.replace('_', ' ')}</span>
                </span>
              </div>
              
              <div className="scholarship-card-body">
                <div className="space-y-3 mb-4">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Created: {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}</span>
                    </div>
                    
                    {application.submittedAt && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-gray-500" />
                        <span>Submitted: {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Updated: {formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                {application.reviewComments && (
                  <div className="p-3 bg-gray-50 rounded-md mb-4">
                    <p className="text-sm font-semibold mb-1 text-gray-700">Review Comments:</p>
                    <p className="text-sm text-gray-600">
                      {application.reviewComments}
                    </p>
                  </div>
                )}

                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewApplication(application.id)
                  }}
                  className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-semibold transition-all duration-200 flex items-center justify-center text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2">
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-6">
                Start your scholarship journey by browsing available opportunities
              </p>
              <button 
                onClick={handleNewApplication}
                className="au-btn-secondary px-6 py-2 rounded-md font-semibold transition-all duration-200"
              >
                Browse Scholarships
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}