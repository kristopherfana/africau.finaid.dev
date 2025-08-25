import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateApplication } from '@/hooks/use-applications'
import { useScholarship } from '@/hooks/use-scholarships'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

const applicationSchema = z.object({
  personalStatement: z.string().min(100, 'Personal statement must be at least 100 characters'),
  academicGoals: z.string().min(50, 'Academic goals must be at least 50 characters'),
  financialNeed: z.string().optional(),
  additionalInfo: z.string().optional(),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
  scholarshipId: string
}

export function ApplicationForm({ scholarshipId }: ApplicationFormProps) {
  const { user } = useUser()
  const navigate = useNavigate()
  
  const { data: scholarship, isLoading: scholarshipLoading } = useScholarship(scholarshipId)
  const createApplication = useCreateApplication()

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      personalStatement: '',
      academicGoals: '',
      financialNeed: '',
      additionalInfo: '',
    },
  })

  const onSubmit = async (data: ApplicationFormData) => {
    if (!user?.id) {
      toast.error('You must be logged in to apply')
      return
    }

    try {
      await createApplication.mutateAsync({
        userId: user.id,
        applicationData: {
          scholarshipId,
          ...data,
        },
      })
      
      toast.success('Application submitted successfully!')
      navigate({ to: '/dashboard/applications' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application')
    }
  }

  if (scholarshipLoading) {
    return <div className="flex justify-center p-8">Loading scholarship details...</div>
  }

  if (!scholarship) {
    return <div className="text-red-500 p-4">Scholarship not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Scholarship Info */}
      <Card>
        <CardHeader>
          <CardTitle>{scholarship.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{scholarship.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Amount: <strong>${scholarship.amount.toLocaleString()}</strong></div>
            <div>Deadline: <strong>{new Date(scholarship.applicationDeadline).toLocaleDateString()}</strong></div>
            <div>Category: <strong>{scholarship.category}</strong></div>
            <div>Level: <strong>{scholarship.level}</strong></div>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="personalStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Statement *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="Tell us about yourself, your background, and why you're applying for this scholarship..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academicGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Goals *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Describe your academic goals and how this scholarship will help you achieve them..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {scholarship.category === 'NEED' && (
                <FormField
                  control={form.control}
                  name="financialNeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Financial Need Statement</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="Please describe your financial situation and why you need this scholarship..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Any additional information you'd like to share (achievements, extracurricular activities, etc.)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/scholarships' })}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createApplication.isPending}
                >
                  {createApplication.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}