import { useScholarship, useHasUserApplied } from '@/hooks/use-scholarships'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, DollarSign, Users } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'

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
  const { user } = useUser()
  const { data: hasApplied } = useHasUserApplied(scholarship.id, user?.id)
  
  const remainingSlots = scholarship.availableSlots - (scholarship._count?.applications || 0)
  const isDeadlinePassed = new Date(scholarship.applicationDeadline) < new Date()
  const canApply = !hasApplied && !isDeadlinePassed && remainingSlots > 0

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{scholarship.title}</CardTitle>
          <Badge variant={isDeadlinePassed ? "destructive" : "default"}>
            {scholarship.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {scholarship.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>${scholarship.amount.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(scholarship.applicationDeadline).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{remainingSlots} of {scholarship.availableSlots} spots available</span>
          </div>
        </div>

        <div className="mt-4">
          <Badge variant="outline">{scholarship.level}</Badge>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        {hasApplied ? (
          <Badge variant="secondary" className="w-full justify-center">
            Application Submitted
          </Badge>
        ) : (
          <Button 
            asChild={canApply}
            disabled={!canApply}
            className="w-full"
            variant={canApply ? "default" : "outline"}
          >
            {canApply ? (
              <Link to="/scholarships/$id/apply" params={{ id: scholarship.id }}>
                Apply Now
              </Link>
            ) : (
              <span>
                {isDeadlinePassed ? 'Deadline Passed' : 
                 remainingSlots <= 0 ? 'No Slots Available' : 'Cannot Apply'}
              </span>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}