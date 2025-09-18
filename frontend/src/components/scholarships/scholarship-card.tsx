import { useHasUserApplied } from '@/hooks/use-scholarships'
import { Calendar, Users, GraduationCap, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Link } from '@tanstack/react-router'
import type { Scholarship } from '@/types/scholarship'

interface ScholarshipCardProps {
  scholarship: Scholarship
  onViewDetails?: () => void
}

export function ScholarshipCard({ scholarship, onViewDetails }: ScholarshipCardProps) {
  const { user } = useAuthStore()
  const { data: hasApplied, isLoading } = useHasUserApplied(scholarship.id, user?.id)
  
  const remainingSlots = scholarship.maxRecipients - scholarship.currentApplications
  const deadlineDate = new Date(scholarship.applicationDeadline)
  const currentDate = new Date()
  
  // Check scholarship status from backend (now dynamically calculated)
  const isScholarshipClosed = scholarship.status === 'CLOSED' || scholarship.status === 'SUSPENDED'
  const isScholarshipUpcoming = scholarship.status === 'DRAFT' // DRAFT now means upcoming
  const canApply = !hasApplied && scholarship.status === 'OPEN' && remainingSlots > 0 && !isLoading
  
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
  const isUrgent = daysUntilDeadline <= 7 && daysUntilDeadline > 0 && !isScholarshipClosed

  return (
    <div className="scholarship-card h-full">
      <div className="scholarship-card-header">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 text-white line-clamp-2">{scholarship.name}</h3>
            <div className="flex items-center space-x-2">
              {scholarship.type === 'MERIT_BASED' && <span className="au-badge au-badge-success text-xs">Merit</span>}
              {scholarship.type === 'NEED_BASED' && <span className="au-badge au-badge-info text-xs">Need-based</span>}
              {scholarship.type === 'FULL' && <span className="au-badge au-badge-warning text-xs">Full</span>}
              {scholarship.type === 'PARTIAL' && <span className="au-badge au-badge-secondary text-xs">Partial</span>}
              <span className="au-badge au-badge-neutral text-xs">{scholarship.sponsor}</span>
            </div>
          </div>
          <GraduationCap className="w-6 h-6 text-white opacity-80" />
        </div>
      </div>
      
      <div className="scholarship-card-body">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {scholarship.description}
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="scholarship-amount">${scholarship.amount.toLocaleString()}</span>
            {isLoading ? (
              <span className="au-badge au-badge-neutral text-xs">Loading...</span>
            ) : hasApplied ? (
              <span className="au-badge au-badge-success flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Applied
              </span>
            ) : isScholarshipClosed ? (
              <span className="au-badge au-badge-danger">Closed</span>
            ) : isScholarshipUpcoming ? (
              <span className="au-badge au-badge-info">Opening Soon</span>
            ) : (
              <span className="au-badge au-badge-success">Open</span>
            )}
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Deadline: {new Date(scholarship.applicationDeadline).toLocaleDateString()}</span>
              {isUrgent && (
                <span className="au-badge au-badge-warning text-xs flex items-center ml-2">
                  <Clock className="w-3 h-3 mr-1" />
                  {daysUntilDeadline} days left
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>{remainingSlots} of {scholarship.maxRecipients} spots available</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-md font-semibold text-center text-sm">
            Checking application status...
          </div>
        ) : hasApplied ? (
          <div className="w-full py-3 px-4 bg-green-50 border border-green-200 text-green-800 rounded-md font-semibold text-center text-sm flex items-center justify-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Application Submitted
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <button 
                onClick={onViewDetails}
                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-semibold transition-all duration-200 flex items-center justify-center text-sm"
              >
                View Details
              </button>
              {canApply && (
                <Link to="/scholarships/$id/apply" params={{ id: scholarship.id }} className="flex-1">
                  <button className="w-full py-2 px-4 au-btn-primary rounded-md font-semibold transition-all duration-200 flex items-center justify-center text-sm">
                    <GraduationCap className="w-4 h-4 mr-1" />
                    Apply
                  </button>
                </Link>
              )}
            </div>
            {!canApply && !hasApplied && (
              <div className="w-full py-2 px-4 bg-red-50 border border-red-200 text-red-600 rounded-md font-semibold text-center text-sm flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {scholarship.status === 'CLOSED' ? 'Applications Closed' :
                 scholarship.status === 'SUSPENDED' ? 'Scholarship Suspended' :
                 scholarship.status === 'DRAFT' ? 'Opens ' + new Date(scholarship.applicationStartDate).toLocaleDateString() :
                 remainingSlots <= 0 ? 'No Slots Available' : 'Cannot Apply'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}