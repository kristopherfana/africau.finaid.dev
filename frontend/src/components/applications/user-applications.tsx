import { useUserApplications, useWithdrawApplication } from '@/hooks/use-applications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useUser } from '@clerk/clerk-react'
import { Calendar, DollarSign, FileText } from 'lucide-react'
import { toast } from 'sonner'

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
}

export function UserApplications() {
  const { user } = useUser()
  const { data, isLoading, error } = useUserApplications(user?.id || '')
  const withdrawApplication = useWithdrawApplication()

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Applications</h2>
        <Badge variant="outline">
          {data.data.length} {data.data.length === 1 ? 'Application' : 'Applications'}
        </Badge>
      </div>

      <div className="grid gap-6">
        {data.data.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {application.scholarship.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Application #{application.applicationNumber}
                  </p>
                </div>
                <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                  {application.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>${application.scholarship.amount.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Applied: {new Date(application.submittedAt || application.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Deadline: {new Date(application.scholarship.applicationDeadline).toLocaleDateString()}</span>
                </div>
              </div>

              {application.status === 'APPROVED' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    🎉 Congratulations! Your application has been approved.
                  </p>
                </div>
              )}

              {application.status === 'REJECTED' && application.decisionNotes && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium mb-1">Decision Notes:</p>
                  <p className="text-sm text-red-700">{application.decisionNotes}</p>
                </div>
              )}

              {application.score && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Score:</span>
                  <Badge variant="outline">{application.score}/100</Badge>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                
                {(application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={withdrawApplication.isPending}
                      >
                        Withdraw
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to withdraw this application? This action cannot be undone.
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {data.data.length} of {data.pagination.total} applications
          </span>
        </div>
      )}
    </div>
  )
}