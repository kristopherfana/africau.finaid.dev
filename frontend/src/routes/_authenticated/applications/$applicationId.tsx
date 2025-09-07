import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Edit, Send, Trash2, FileX, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useApplication, useWithdrawApplication } from '@/hooks/use-applications'
import { ApplicationStatus } from '@/types/application'
import { formatDistanceToNow, format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/_authenticated/applications/$applicationId')({
  component: ApplicationDetailPage,
})

function ApplicationDetailPage() {
  const { applicationId } = Route.useParams()
  const navigate = useNavigate()
  
  const { data: application, isLoading, error } = useApplication(applicationId)
  const withdrawMutation = useWithdrawApplication()
  
  // TODO: Get actual user ID from auth context
  const userId = 'current-user-id'

  const handleGoBack = () => {
    navigate({ to: '/applications' })
  }

  const handleEdit = () => {
    // TODO: Navigate to edit form
    toast.info('Edit functionality will be available soon')
  }

  const handleWithdraw = async () => {
    try {
      await withdrawMutation.mutateAsync({ id: applicationId, userId })
      toast.success('Application withdrawn successfully')
    } catch (error) {
      toast.error('Failed to withdraw application')
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.DRAFT:
        return 'secondary'
      case ApplicationStatus.SUBMITTED:
        return 'default'
      case ApplicationStatus.UNDER_REVIEW:
        return 'default'
      case ApplicationStatus.APPROVED:
        return 'default'
      case ApplicationStatus.REJECTED:
        return 'destructive'
      case ApplicationStatus.WITHDRAWN:
        return 'secondary'
      default:
        return 'default'
    }
  }

  const canEdit = application?.status === ApplicationStatus.DRAFT
  const canWithdraw = application?.status === ApplicationStatus.SUBMITTED || 
                     application?.status === ApplicationStatus.UNDER_REVIEW ||
                     application?.status === ApplicationStatus.DRAFT

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Application not found or error loading details.
            </p>
            <div className="text-center mt-4">
              <Button onClick={handleGoBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !application) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button onClick={handleGoBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{application.scholarshipName}</h1>
            <p className="text-muted-foreground">
              Application #{application.id}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(application.status)}>
              {application.status.replace('_', ' ')}
            </Badge>
            
            {canEdit && (
              <Button onClick={handleEdit} size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            
            {canWithdraw && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <FileX className="mr-2 h-4 w-4" />
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
                    <AlertDialogAction onClick={handleWithdraw} disabled={withdrawMutation.isPending}>
                      {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Applicant</h4>
                <p className="font-medium">{application.applicantName}</p>
                <p className="text-sm text-muted-foreground">{application.applicantEmail}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                <Badge variant={getStatusColor(application.status)}>
                  {application.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                <p className="font-medium">
                  {format(new Date(application.createdAt), 'PPP')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                </p>
              </div>
              
              {application.submittedAt && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Submitted</h4>
                  <p className="font-medium">
                    {format(new Date(application.submittedAt), 'PPP')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Statement */}
        {application.personalStatement && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{application.personalStatement}</p>
            </CardContent>
          </Card>
        )}

        {/* Academic Information */}
        {application.academicInfo && Object.keys(application.academicInfo).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(application.academicInfo).map(([key, value]) => (
                  <div key={key}>
                    <dt className="font-medium text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Financial Information */}
        {application.financialInfo && Object.keys(application.financialInfo).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(application.financialInfo).map(([key, value]) => (
                  <div key={key}>
                    <dt className="font-medium text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {application.documentIds && application.documentIds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {application.documentIds.map((docId, index) => (
                  <div key={docId} className="flex items-center gap-2 p-2 border rounded">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Document {index + 1}</span>
                    <span className="text-sm text-muted-foreground">({docId})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Comments */}
        {application.reviewComments && (
          <Card>
            <CardHeader>
              <CardTitle>Review Comments</CardTitle>
              {application.reviewedBy && (
                <CardDescription>
                  Reviewed by {application.reviewedBy}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{application.reviewComments}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}