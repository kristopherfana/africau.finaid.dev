import { useScholarship, useHasUserApplied } from '@/hooks/use-scholarships'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, DollarSign, Users, GraduationCap, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Link } from '@tanstack/react-router'
import { PatternWrapper } from '@/components/au-showcase'

interface ScholarshipCardProps {
  scholarship: {
    id: string
    title: string
    description: string
    amount: number
    category: string
    level: string
    applicationDeadline: string
    availableSlots: number
    _count?: {
      applications: number
    }
  }
}

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const { user } = useAuthStore()
  const { data: hasApplied } = useHasUserApplied(scholarship.id, user?.id)
  
  const remainingSlots = scholarship.availableSlots - (scholarship._count?.applications || 0)
  const isDeadlinePassed = new Date(scholarship.applicationDeadline) < new Date()
  const canApply = !hasApplied && !isDeadlinePassed && remainingSlots > 0
  
  const daysUntilDeadline = Math.ceil((new Date(scholarship.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const isUrgent = daysUntilDeadline <= 7 && daysUntilDeadline > 0

  return (
    <div className="scholarship-card h-full">
      <div className="scholarship-card-header">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 text-white line-clamp-2">{scholarship.title}</h3>
            <div className="flex items-center space-x-2">
              {scholarship.category === 'MERIT' && <span className="au-badge au-badge-success text-xs">Merit</span>}
              {scholarship.category === 'NEED' && <span className="au-badge au-badge-info text-xs">Need-based</span>}
              {scholarship.category === 'RESEARCH' && <span className="au-badge au-badge-warning text-xs">Research</span>}
              {scholarship.category === 'SPORTS' && <span className="au-badge au-badge-secondary text-xs">Sports</span>}
              {scholarship.category === 'ARTS' && <span className="au-badge au-badge-primary text-xs">Arts</span>}
              <span className="au-badge au-badge-neutral text-xs">{scholarship.level}</span>
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
            {hasApplied && (
              <span className="au-badge au-badge-success flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Applied
              </span>
            )}
            {!hasApplied && !isDeadlinePassed && (
              <span className="au-badge au-badge-success">Open</span>
            )}
            {isDeadlinePassed && (
              <span className="au-badge au-badge-danger">Closed</span>
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
              <span>{remainingSlots} of {scholarship.availableSlots} spots available</span>
            </div>
          </div>
        </div>

        {hasApplied ? (
          <div className="w-full py-3 px-4 bg-green-50 border border-green-200 text-green-800 rounded-md font-semibold text-center text-sm flex items-center justify-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Application Submitted
          </div>
        ) : (
          <Link to="/scholarships/$id/apply" params={{ id: scholarship.id }}>
            <button 
              disabled={!canApply}
              className={`w-full py-3 px-4 rounded-md font-semibold transition-all duration-200 flex items-center justify-center text-sm ${
                canApply 
                  ? 'au-btn-primary' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canApply ? (
                <>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Apply Now
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {isDeadlinePassed ? 'Deadline Passed' : 
                   remainingSlots <= 0 ? 'No Slots Available' : 'Cannot Apply'}
                </>
              )}
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}