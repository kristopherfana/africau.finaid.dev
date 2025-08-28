import { useState } from 'react'
import { useScholarship, useHasUserApplied } from '@/hooks/use-scholarships'
import { useAuth } from '@/stores/authStore'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Building, 
  FileText, 
  CheckCircle, 
  Clock,
  X,
  ExternalLink,
  GraduationCap,
  AlertCircle
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface ScholarshipDetailsOverlayProps {
  scholarshipId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ScholarshipDetailsOverlay({ 
  scholarshipId, 
  isOpen, 
  onClose 
}: ScholarshipDetailsOverlayProps) {
  const { user } = useAuth()
  const { data: scholarship, isLoading } = useScholarship(scholarshipId || '')
  const { data: hasApplied, isLoading: checkingApplication } = useHasUserApplied(
    scholarshipId || '', 
    user?.id
  )

  if (!scholarshipId) return null

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-gray-600">Loading scholarship details...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!scholarship) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Scholarship not found</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const deadlineDate = new Date(scholarship.applicationDeadline)
  const isDeadlinePassed = deadlineDate <= new Date()
  const isScholarshipClosed = scholarship.status === 'CLOSED' || scholarship.status === 'SUSPENDED' || isDeadlinePassed
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const remainingSlots = scholarship.maxRecipients - scholarship.currentApplications
  const canApply = !hasApplied && !isScholarshipClosed && remainingSlots > 0 && !checkingApplication

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                {scholarship.name}
              </DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {scholarship.type.replace('_', ' ')}
                </Badge>
                {scholarship.status === 'OPEN' && !isScholarshipClosed ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Open
                  </Badge>
                ) : (
                  <Badge variant="destructive">Closed</Badge>
                )}
                {daysUntilDeadline <= 7 && daysUntilDeadline > 0 && (
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                    {daysUntilDeadline} days left
                  </Badge>
                )}
                {hasApplied && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Applied
                  </Badge>
                )}
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-6">
            
            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Award Amount</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  ${scholarship.amount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Available Slots</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {remainingSlots} / {scholarship.maxRecipients}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Deadline</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {deadlineDate.toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Sponsor</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {scholarship.sponsor}
                </span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Description</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {scholarship.description}
              </p>
            </div>

            {/* Eligibility Criteria */}
            {scholarship.eligibilityCriteria && scholarship.eligibilityCriteria.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Eligibility Requirements</h3>
                </div>
                <div className="space-y-2">
                  {scholarship.eligibilityCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{criteria}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Important Dates</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Application Opens</span>
                  <span className="font-medium text-gray-900">
                    {new Date(scholarship.applicationStartDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded border-l-2 border-red-500">
                  <span className="text-red-700 font-medium">Application Deadline</span>
                  <div className="text-right">
                    <span className="font-semibold text-red-900 block">
                      {deadlineDate.toLocaleDateString()}
                    </span>
                    {daysUntilDeadline > 0 && (
                      <span className={`text-xs ${daysUntilDeadline <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                        {daysUntilDeadline} days remaining
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {checkingApplication ? (
              <span className="text-sm text-gray-600">Checking status...</span>
            ) : hasApplied ? (
              <div className="flex items-center text-sm text-green-700">
                <CheckCircle className="w-4 h-4 mr-1" />
                Application submitted
              </div>
            ) : null}
          </div>
          
          <div className="flex items-center space-x-3">
            <Link to={`/scholarships/${scholarshipId}`}>
              <Button variant="outline" size="sm" onClick={onClose}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Full Page
              </Button>
            </Link>
            
            {canApply ? (
              <Link to={`/scholarships/${scholarshipId}/apply`}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onClose}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
              </Link>
            ) : (
              <Button size="sm" disabled>
                {hasApplied ? 'Applied' : 
                 isScholarshipClosed ? 'Closed' : 
                 remainingSlots <= 0 ? 'Full' : 'Unavailable'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}