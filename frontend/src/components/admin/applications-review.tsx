import { useApplicationsForReview, useUpdateApplicationStatus } from '@/hooks/use-applications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUser } from '@clerk/clerk-react'
import { Calendar, DollarSign, User, FileText, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  decisionNotes: z.string().min(10, 'Decision notes must be at least 10 characters'),
  score: z.number().min(0).max(100).optional(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

export function ApplicationsReview() {
  const { user } = useUser()
  const { data, isLoading, error } = useApplicationsForReview({
    status: 'UNDER_REVIEW',
    page: 1,
    limit: 20
  })
  const updateStatus = useUpdateApplicationStatus()
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      decisionNotes: '',
      score: undefined,
    },
  })

  const handleReview = async (data: ReviewFormData, applicationId: string) => {
    if (!user?.id) return

    try {
      await updateStatus.mutateAsync({
        id: applicationId,
        status: data.status,
        adminId: user.id,
        decisionNotes: data.decisionNotes,
        score: data.score,
      })
      
      toast.success(`Application ${data.status.toLowerCase()} successfully`)
      setSelectedApplication(null)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application status')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading applications for review...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading applications: {error.message}</div>
  }

  if (!data?.data.length) {
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Applications to Review</h3>
        <p className="text-muted-foreground">
          All applications have been reviewed or there are no pending applications.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Applications for Review</h2>
        <Badge variant="outline">
          {data.data.length} Pending Review
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
                <Badge variant="outline">
                  {application.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Application Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{application.user.profiles?.[0]?.firstName} {application.user.profiles?.[0]?.lastName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>${application.scholarship.amount.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted: {new Date(application.submittedAt || application.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="text-sm">
                  <span className="font-medium">GPA: </span>
                  {application.user.profiles?.[0]?.gpa || 'N/A'}
                </div>
              </div>

              {/* Student Info */}
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Program: </span>
                    {application.user.profiles?.[0]?.program || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Level: </span>
                    {application.user.profiles?.[0]?.level || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Year: </span>
                    {application.user.profiles?.[0]?.yearOfStudy || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Student ID: </span>
                    {application.user.profiles?.[0]?.studentId || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Application Content */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">Personal Statement:</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                    {application.personalStatement}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">Academic Goals:</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                    {application.academicGoals}
                  </p>
                </div>

                {application.financialNeed && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Financial Need:</h4>
                    <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      {application.financialNeed}
                    </p>
                  </div>
                )}

                {application.additionalInfo && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Additional Information:</h4>
                    <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      {application.additionalInfo}
                    </p>
                  </div>
                )}
              </div>

              {/* Review Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(application.id)
                        form.setValue('status', 'APPROVED')
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Review Application</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => handleReview(data, application.id))} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="score"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Score (0-100)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="100"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="decisionNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Decision Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field}
                                  rows={4}
                                  placeholder="Provide feedback on the decision..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            disabled={updateStatus.isPending}
                            onClick={() => form.setValue('status', 'APPROVED')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            type="submit" 
                            variant="destructive"
                            disabled={updateStatus.isPending}
                            onClick={() => form.setValue('status', 'REJECTED')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm">
                  View Full Application
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}