import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateApplication } from '@/hooks/use-applications'
import { useScholarship } from '@/hooks/use-scholarships'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/stores/authStore'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { User, Target, DollarSign, FileText, Save, Send } from 'lucide-react'

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
  const { user } = useAuth()
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
          applicantId: user.id, // Use user.id as applicantId
          personalStatement: data.personalStatement,
          academicInfo: {
            academicGoals: data.academicGoals,
            additionalInfo: data.additionalInfo || '',
          },
          financialInfo: data.financialNeed ? {
            financialNeed: data.financialNeed,
          } : {},
          documentIds: [],
          status: 'SUBMITTED' as any,
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
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Personal Statement Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Personal Statement</h3>
                <p className="text-gray-600 text-sm">Tell us about yourself and your motivations</p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="personalStatement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-gray-800">
                    Why are you applying for this scholarship? *
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-3">
                    Share your background, experiences, and what motivates you to pursue your education. 
                    This is your opportunity to make a personal connection with the selection committee.
                  </p>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={8}
                      className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="I am applying for this scholarship because..."
                    />
                  </FormControl>
                  <div className="flex justify-between items-center mt-2">
                    <FormMessage />
                    <span className="text-xs text-gray-500">
                      {field.value?.length || 0} characters (minimum 100)
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Academic Goals Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Academic Goals</h3>
                <p className="text-gray-600 text-sm">Describe your educational objectives and career aspirations</p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="academicGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-gray-800">
                    What are your academic and career goals? *
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-3">
                    Explain how this scholarship will help you achieve your educational objectives and 
                    advance your career aspirations. Be specific about your plans and timeline.
                  </p>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={6}
                      className="resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="My academic goals include..."
                    />
                  </FormControl>
                  <div className="flex justify-between items-center mt-2">
                    <FormMessage />
                    <span className="text-xs text-gray-500">
                      {field.value?.length || 0} characters (minimum 50)
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Financial Need Section - Conditional */}
          {scholarship.type === 'NEED_BASED' && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Financial Need Statement</h3>
                  <p className="text-gray-600 text-sm">Explain your financial circumstances</p>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="financialNeed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium text-gray-800">
                      Please describe your financial situation
                    </FormLabel>
                    <p className="text-sm text-gray-600 mb-3">
                      Provide details about your financial circumstances and how this scholarship 
                      would help alleviate financial barriers to your education.
                    </p>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={6}
                        className="resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="My financial situation is..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Additional Information Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Additional Information</h3>
                <p className="text-gray-600 text-sm">Share any other relevant details (optional)</p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-gray-800">
                    Achievements, Activities, and Other Information
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-3">
                    Include any achievements, extracurricular activities, volunteer work, leadership roles, 
                    or other information that strengthens your application.
                  </p>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      className="resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Additional achievements and activities..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Application Actions */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Ready to Submit?</h4>
                <p className="text-sm text-gray-600">
                  Please review your application carefully before submitting. You can save as draft to continue later.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/scholarships' })}
                  className="flex items-center gap-2"
                >
                  Cancel
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2 bg-white hover:bg-gray-50"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={createApplication.isPending}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 min-w-[140px]"
                >
                  {createApplication.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}