import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUserApplications } from '@/hooks/use-applications'
import { ApplicationStatus } from '@/types/application'
import { formatDistanceToNow } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/applications')({
  component: ApplicationsPage,
})

function ApplicationsPage() {
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

  const handleNewApplication = () => {
    navigate({ to: '/scholarships' })
  }

  const handleViewApplication = (id: string) => {
    navigate({ to: `/applications/${id}` })
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Error loading applications. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your scholarship applications
          </p>
        </div>
        <Button onClick={handleNewApplication}>
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value={ApplicationStatus.DRAFT}>Drafts</TabsTrigger>
          <TabsTrigger value={ApplicationStatus.SUBMITTED}>Submitted</TabsTrigger>
          <TabsTrigger value={ApplicationStatus.UNDER_REVIEW}>Under Review</TabsTrigger>
          <TabsTrigger value={ApplicationStatus.APPROVED}>Approved</TabsTrigger>
          <TabsTrigger value={ApplicationStatus.REJECTED}>Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : applications && applications.length > 0 ? (
            applications.map((application) => (
              <Card 
                key={application.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleViewApplication(application.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {application.scholarshipName}
                    </CardTitle>
                    <Badge variant={getStatusColor(application.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(application.status)}
                        {application.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>
                  <CardDescription>
                    Application ID: {application.id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {application.submittedAt && (
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-medium">
                          {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {application.reviewComments && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-1">Review Comments:</p>
                      <p className="text-sm text-muted-foreground">
                        {application.reviewComments}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your scholarship journey by browsing available opportunities
                  </p>
                  <Button onClick={handleNewApplication}>
                    Browse Scholarships
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}