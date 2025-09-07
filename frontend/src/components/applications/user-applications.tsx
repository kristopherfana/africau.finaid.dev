import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Calendar, CheckCircle, Clock, DollarSign, FileText, XCircle } from 'lucide-react'
import { useUserApplications, useWithdrawApplication } from '@/hooks/use-applications'
import { useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
}

export function UserApplications() {
  const { user } = useAuthStore()
  console.log('UserApplications - Current user:', user)
  const { data, isLoading, error } = useUserApplications(user?.id || '')
  console.log('UserApplications - Data:', data, 'Loading:', isLoading, 'Error:', error)
  const withdrawApplication = useWithdrawApplication()
  const navigate = useNavigate()

  const handleWithdraw = async (applicationId: string) => {
    if (!user?.id) return

    try {
      await withdrawApplication.mutateAsync({
        id: applicationId,
        userId: user.id,
      })
      toast.success('Application withdrawn successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw application')
    }
  }

  const handleViewDetails = (applicationId: string) => {
    console.log('UserApplications - Navigating to application:', applicationId)
    console.log('UserApplications - Target path:', `/applications/${applicationId}`)
    navigate({ to: `/applications/${applicationId}` })
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading your applications...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading applications: {error.message}</div>
  }

  if (!data?.data.length) {
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
        <p className="text-muted-foreground">
          You haven't applied to any scholarships yet. Browse available scholarships to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Applications Summary */}
      <div className="au-card">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Applications</h2>
              <p className="text-gray-600 mt-1">Track the progress of all your scholarship applications</p>
            </div>
            <span className="au-badge au-badge-info text-lg px-4 py-2">
              {data.data.length} {data.data.length === 1 ? 'Application' : 'Applications'}
            </span>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {data.data.map((application) => (
          <div key={application.id} className="au-card hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Application Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {application.scholarship.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Application #{application.applicationNumber}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {application.status === 'DRAFT' && <span className="au-badge au-badge-neutral">Draft</span>}
                  {application.status === 'SUBMITTED' && <span className="au-badge au-badge-info">Submitted</span>}
                  {application.status === 'UNDER_REVIEW' && <span className="au-badge au-badge-warning">Under Review</span>}
                  {application.status === 'APPROVED' && <span className="au-badge au-badge-success">Approved</span>}
                  {application.status === 'REJECTED' && <span className="au-badge au-badge-danger">Rejected</span>}
                  {application.status === 'WITHDRAWN' && <span className="au-badge au-badge-neutral">Withdrawn</span>}
                </div>
              </div>

              {/* Application Details Grid */}
              <div className="au-grid au-grid-3 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Award Amount:</span>
                  <span className="font-bold text-green-600">${application.scholarship.amount.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Applied:</span>
                  <span className="text-gray-700">{new Date(application.submittedAt || application.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Deadline:</span>
                  <span className="text-gray-700">{new Date(application.scholarship.applicationDeadline).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status-specific messages */}
              {application.status === 'APPROVED' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">
                        🎉 Congratulations! Your application has been approved.
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        You will receive further instructions via email regarding award disbursement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {application.status === 'REJECTED' && application.decisionNotes && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="flex items-start space-x-2">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-800 font-medium mb-1">Decision Notes:</p>
                      <p className="text-sm text-red-700">{application.decisionNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {application.status === 'UNDER_REVIEW' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <div className="flex items-start space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        Your application is currently under review.
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        We'll notify you once a decision has been made. This typically takes 2-4 weeks.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {application.score && (
                <div className="flex items-center space-x-2 text-sm mb-4">
                  <span className="font-medium text-gray-700">Application Score:</span>
                  <span className="au-badge au-badge-info">{application.score}/100</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleViewDetails(application.id)}
                  className="au-btn-secondary px-4 py-2 text-sm rounded-md font-semibold transition-all duration-200 flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Details
                </button>
                
                {(application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button 
                        disabled={withdrawApplication.isPending}
                        className="py-2 px-4 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200 flex items-center text-sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Withdraw
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to withdraw this application? This action cannot be undone and you will not be able to reapply for this scholarship.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleWithdraw(application.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Withdraw Application
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {data?.pagination && data.pagination.total > data.data.length && (
        <div className="text-center">
          <span className="text-sm text-gray-500">
            Showing {data.data.length} of {data.pagination.total} applications
          </span>
        </div>
      )}
    </div>
  )
}