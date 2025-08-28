import { ArrowLeft, Building, Calendar, CheckCircle, Clock, DollarSign, FileText, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHasUserApplied, useScholarship } from '@/hooks/use-scholarships'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { StudentHeader } from '@/components/layout/student-header'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore'

export const Route = createFileRoute('/_authenticated/scholarships/$id/')({
  component: ScholarshipDetailsPage,
})

function ScholarshipDetailsPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  const { data: scholarship, isLoading, error } = useScholarship(id)
  const { data: hasApplied, isLoading: checkingApplication } = useHasUserApplied(id, user?.id)

  if (isLoading) {
    return (
      <>
        <Main>
          <div className="au-hero-academic min-h-[200px] flex items-center justify-center">
            <div className="text-white text-xl">Loading scholarship details...</div>
          </div>
        </Main>
      </>
    )
  }

  if (error || !scholarship) {
    return (
      <>
        <Main>
          <div className="au-hero-academic min-h-[200px] flex items-center justify-center">
            <div className="text-white text-xl">Error loading scholarship details</div>
          </div>
        </Main>
      </>
    )
  }

  const deadlineDate = new Date(scholarship.applicationDeadline)
  const isDeadlinePassed = deadlineDate <= new Date()
  const isScholarshipClosed = scholarship.status === 'CLOSED' || scholarship.status === 'SUSPENDED' || isDeadlinePassed
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const remainingSlots = scholarship.maxRecipients - scholarship.currentApplications
  const canApply = !hasApplied && !isScholarshipClosed && remainingSlots > 0 && !checkingApplication

  return (
    <>
      <Main>
        {/* Header Section */}
        <div className="container mx-auto">
          <div className="mb-6">
            <Link to="/scholarships">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Scholarships
              </Button>
            </Link>
            
            <h1 className="text-3xl font-bold mb-3">{scholarship.name}</h1>
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
            
            {canApply && (
              <div className="mt-4">
                <Link to="/scholarships/$id/apply" params={{ id }}>
                  <Button className="font-semibold">
                    Apply Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-6 pb-6">
            
            {/* Key Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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

              {/* Sponsor Information */}
              <div className="col-span-1 md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium">Sponsored By</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{scholarship.sponsor}</p>
                    <p className="text-gray-500 text-sm mt-1">Trusted scholarship provider</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  About This Scholarship
                </h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {scholarship.description}
                </p>
              </div>
            </div>

            {/* Eligibility Criteria */}
            {scholarship.eligibilityCriteria && scholarship.eligibilityCriteria.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Eligibility Requirements
                  </h2>
                </div>
                <div className="space-y-4">
                  {scholarship.eligibilityCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      </div>
                      <p className="text-gray-800 font-medium leading-relaxed">{criteria}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Make sure you meet all requirements before applying
                  </p>
                </div>
              </div>
            )}

            {/* Important Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Important Timeline
                </h2>
              </div>
              <div className="space-y-6">
                {/* Timeline Visual */}
                <div className="relative">
                  <div className="absolute left-6 top-12 bottom-6 w-0.5 bg-gray-300"></div>
                  
                  {/* Application Opens */}
                  <div className="relative flex items-start space-x-4 pb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">Application Period Opens</h3>
                      <p className="text-blue-600 font-medium text-lg">
                        {new Date(scholarship.applicationStartDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">Applications become available for submission</p>
                    </div>
                  </div>

                  {/* Application Deadline */}
                  <div className="relative flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      daysUntilDeadline <= 7 && daysUntilDeadline > 0 
                        ? 'bg-orange-500' 
                        : daysUntilDeadline <= 0 
                        ? 'bg-red-500' 
                        : 'bg-green-500'
                    }`}>
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">Final Application Deadline</h3>
                      <p className={`font-medium text-lg ${
                        daysUntilDeadline <= 7 && daysUntilDeadline > 0 
                          ? 'text-orange-600' 
                          : daysUntilDeadline <= 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {deadlineDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {daysUntilDeadline > 0 ? (
                        <p className={`text-sm font-medium mt-1 ${
                          daysUntilDeadline <= 7 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {daysUntilDeadline} days remaining • {daysUntilDeadline <= 7 ? 'Apply soon!' : 'Plan ahead'}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-red-600 mt-1">
                          Deadline has passed
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Urgency Alert */}
                {daysUntilDeadline <= 7 && daysUntilDeadline > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-orange-600 mr-3" />
                      <div>
                        <p className="font-medium text-orange-800">Application deadline approaching!</p>
                        <p className="text-orange-700 text-sm mt-1">
                          Only {daysUntilDeadline} days left to submit your application.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </Main>
    </>
  )
}