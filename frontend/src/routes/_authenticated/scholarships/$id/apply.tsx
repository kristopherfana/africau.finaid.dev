import { createFileRoute } from '@tanstack/react-router'
import { ApplicationForm } from '@/components/applications/application-form'
import { Main } from '@/components/layout/main'
import { useScholarship, useHasUserApplied } from '@/hooks/use-scholarships'
import { useAuth } from '@/stores/authStore'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, FileText, Shield, CheckCircle, DollarSign, Users, Calendar, Building, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_authenticated/scholarships/$id/apply')({
  component: ApplyPage,
})

function ApplyPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  const { data: scholarship, isLoading, error } = useScholarship(id)
  const { data: hasApplied, isLoading: checkingApplication } = useHasUserApplied(id, user?.id)
  
  if (isLoading) {
    return (
      <Main>
        <div className="container mx-auto px-6 py-12 text-center">
          <div className="text-xl text-gray-600">Loading application form...</div>
        </div>
      </Main>
    )
  }

  if (error || !scholarship) {
    return (
      <Main>
        <div className="container mx-auto px-6 py-12 text-center">
          <div className="text-xl text-red-600">Error loading scholarship details</div>
        </div>
      </Main>
    )
  }

  const deadlineDate = new Date(scholarship.applicationDeadline)
  const isDeadlinePassed = deadlineDate <= new Date()
  const isScholarshipClosed = scholarship.status === 'CLOSED' || scholarship.status === 'SUSPENDED' || isDeadlinePassed
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const remainingSlots = scholarship.maxRecipients - scholarship.currentApplications
  const canApply = !hasApplied && !isScholarshipClosed && remainingSlots > 0 && !checkingApplication

  return (
    <Main>
      {/* Header Section */}
      <div className="container mx-auto">
        <div className="mb-6">
          <Link to={`/scholarships/${id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scholarship Details
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold mb-3">Apply for Scholarship</h1>
          <h2 className="text-2xl text-gray-700 mb-3">{scholarship.name}</h2>
          <div className="flex gap-2 mb-4 flex-wrap">
            <Badge variant="outline" className="text-sm">
              {scholarship.type.replace('_', ' ')}
            </Badge>
            {scholarship.status === 'OPEN' && !isScholarshipClosed ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-sm">Open</Badge>
            ) : (
              <Badge variant="destructive" className="text-sm">Closed</Badge>
            )}
            {daysUntilDeadline <= 7 && daysUntilDeadline > 0 && (
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-sm">
                {daysUntilDeadline} days left
              </Badge>
            )}
            {hasApplied && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Applied
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Award Amount: <span className="font-semibold text-foreground">${scholarship.amount.toLocaleString()}</span> • 
            Sponsored by <span className="font-semibold text-foreground">{scholarship.sponsor}</span>
          </p>
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="container mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Award Amount Card - Featured */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-red-700 font-medium text-sm uppercase tracking-wide">Award Amount</p>
                  <p className="text-red-600 text-sm mt-1">Full scholarship funding</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-red-800">
                  ${scholarship.amount.toLocaleString()}
                </span>
                <p className="text-red-600 text-sm mt-1">Per recipient</p>
              </div>
            </div>
          </div>

          {/* Available Slots */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Available Slots</p>
                  <p className="text-gray-500 text-sm">Remaining positions</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">
                  {remainingSlots}
                </span>
                <p className="text-gray-500 text-sm">of {scholarship.maxRecipients}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${((scholarship.maxRecipients - remainingSlots) / scholarship.maxRecipients) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {scholarship.maxRecipients - remainingSlots} applications received
              </p>
            </div>
          </div>

          {/* Application Deadline */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  daysUntilDeadline <= 7 && daysUntilDeadline > 0 
                    ? 'bg-orange-100' 
                    : 'bg-green-100'
                }`}>
                  <Calendar className={`w-6 h-6 ${
                    daysUntilDeadline <= 7 && daysUntilDeadline > 0 
                      ? 'text-orange-600' 
                      : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Application Deadline</p>
                  <p className="text-gray-500 text-sm">Final submission date</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-lg font-semibold text-gray-900">
                {deadlineDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {daysUntilDeadline > 0 && (
                <p className={`text-sm font-medium mt-1 ${
                  daysUntilDeadline <= 7 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {daysUntilDeadline} days remaining
                </p>
              )}
              {daysUntilDeadline <= 0 && (
                <p className="text-sm font-medium text-red-600 mt-1">
                  Deadline has passed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Application Guidelines */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Application Guidelines
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Complete Information</h3>
              <p className="text-gray-600 text-sm">
                Provide accurate and complete information in all required fields.
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Process</h3>
              <p className="text-gray-600 text-sm">
                Your personal information is protected and handled securely.
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Review & Submit</h3>
              <p className="text-gray-600 text-sm">
                Review your application carefully before final submission.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-blue-800">Important Application Guidelines</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">Required Documents:</h4>
                <ul className="space-y-1 text-sm text-blue-600">
                  <li>• Official academic transcripts</li>
                  <li>• Personal statement/essay</li>
                  <li>• Letter of recommendation (if applicable)</li>
                  <li>• Financial need documentation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">Application Tips:</h4>
                <ul className="space-y-1 text-sm text-blue-600">
                  <li>• Save your progress regularly</li>
                  <li>• Double-check all information</li>
                  <li>• Submit before the deadline</li>
                  <li>• Keep copies of all documents</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Scholarship Application Form
            </h2>
          </div>
          <p className="text-gray-600 mb-8">
            Please fill out all sections completely and accurately. 
            You can save your progress and return to complete it later.
          </p>
          
          <ApplicationForm scholarshipId={id} />
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center">
          <h2 className="text-white text-2xl font-bold mb-4">Need Help with Your Application?</h2>
          <p className="text-blue-100 mb-8">
            Our student support team is here to help you through the application process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
              Contact Support
            </Button>
            <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
              Application FAQ
            </Button>
          </div>
        </div>
      </div>
    </Main>
  )
}