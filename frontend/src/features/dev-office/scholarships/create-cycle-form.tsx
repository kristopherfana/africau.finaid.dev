import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, DollarSign, Users, Save, Loader2 } from 'lucide-react'
import { scholarshipsAPI } from '@/lib/api'
import { toast } from 'sonner'

interface ScholarshipCriteria {
  id: string
  type: string
  value: string
  isMandatory: boolean
}

interface CreateCycleFormData {
  academicYear: string
  amount: string
  maxRecipients: string
  applicationStartDate: string
  applicationDeadline: string
  description: string
  status: 'DRAFT' | 'OPEN'
  criteria: ScholarshipCriteria[]
}

interface CreateCycleFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newCycle: any) => void
  programId: string
  programInfo?: {
    name: string
    sponsor: string
    lastCycle?: {
      amount: number
      maxRecipients: number
      description?: string
    }
  }
}

export function CreateCycleForm({
  isOpen,
  onClose,
  onSuccess,
  programId,
  programInfo
}: CreateCycleFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCycleFormData>({
    academicYear: '',
    amount: programInfo?.lastCycle?.amount?.toString() || '',
    maxRecipients: programInfo?.lastCycle?.maxRecipients?.toString() || '',
    applicationStartDate: '',
    applicationDeadline: '',
    description: programInfo?.lastCycle?.description || '',
    status: 'DRAFT',
    criteria: [
      {
        id: '1',
        type: 'MIN_GPA',
        value: '3.0',
        isMandatory: true
      }
    ]
  })

  const handleInputChange = (field: keyof CreateCycleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addCriteria = () => {
    const newCriteria: ScholarshipCriteria = {
      id: Date.now().toString(),
      type: 'NATIONALITY',
      value: '',
      isMandatory: true
    }
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCriteria]
    }))
  }

  const updateCriteria = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => c.id === id ? { ...c, [field]: value } : c)
    }))
  }

  const removeCriteria = (id: string) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== id)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.academicYear.trim()) {
      toast.error('Please provide an academic year')
      return
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please provide a valid award amount')
      return
    }

    if (!formData.maxRecipients || Number(formData.maxRecipients) <= 0) {
      toast.error('Please provide a valid number of recipients')
      return
    }

    if (!formData.applicationStartDate) {
      toast.error('Please provide an application start date')
      return
    }

    if (!formData.applicationDeadline) {
      toast.error('Please provide an application deadline')
      return
    }

    if (new Date(formData.applicationStartDate) >= new Date(formData.applicationDeadline)) {
      toast.error('Application start date must be before the deadline')
      return
    }

    // Check if all criteria have values
    const invalidCriteria = formData.criteria.find(c => !c.value.trim())
    if (invalidCriteria) {
      toast.error('Please provide values for all eligibility criteria')
      return
    }

    try {
      setLoading(true)

      // Create the cycle data
      const cycleData = {
        academicYear: formData.academicYear,
        description: formData.description,
        amount: Number(formData.amount),
        type: 'MERIT_BASED', // Default type
        applicationStartDate: formData.applicationStartDate,
        applicationDeadline: formData.applicationDeadline,
        eligibilityCriteria: formData.criteria.map(c => c.value),
        maxRecipients: Number(formData.maxRecipients),
        status: formData.status
      }

      const newCycle = await scholarshipsAPI.createCycle(programId, cycleData)

      toast.success(`Successfully created ${formData.academicYear} cycle for ${programInfo?.name || 'this program'}`)
      onSuccess(newCycle)
      onClose()

      // Reset form
      setFormData({
        academicYear: '',
        amount: programInfo?.lastCycle?.amount?.toString() || '',
        maxRecipients: programInfo?.lastCycle?.maxRecipients?.toString() || '',
        applicationStartDate: '',
        applicationDeadline: '',
        description: programInfo?.lastCycle?.description || '',
        status: 'DRAFT',
        criteria: [
          {
            id: '1',
            type: 'MIN_GPA',
            value: '3.0',
            isMandatory: true
          }
        ]
      })
    } catch (error: any) {
      console.error('Error creating cycle:', error)
      toast.error(error.message || 'Failed to create cycle. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const criteriaTypes = [
    { value: 'MIN_GPA', label: 'Minimum GPA' },
    { value: 'NATIONALITY', label: 'Nationality' },
    { value: 'GENDER', label: 'Gender' },
    { value: 'ACADEMIC_LEVEL', label: 'Academic Level' },
    { value: 'PROGRAM', label: 'Academic Program' },
    { value: 'FINANCIAL_NEED', label: 'Financial Need' },
    { value: 'AGE_RANGE', label: 'Age Range' },
    { value: 'YEAR_OF_STUDY', label: 'Year of Study' }
  ]

  // Auto-generate academic year suggestion
  const getCurrentAcademicYear = () => {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    return `${currentYear}-${nextYear}`
  }

  // Auto-populate academic year if empty
  if (!formData.academicYear && isOpen) {
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        academicYear: getCurrentAcademicYear()
      }))
    }, 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create New Application Cycle
          </DialogTitle>
          <DialogDescription>
            Create a new application cycle for {programInfo?.name || 'this scholarship program'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Input
                  id="academicYear"
                  placeholder="e.g., 2025-2026"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'DRAFT' | 'OPEN') => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft (Not visible to students)</SelectItem>
                    <SelectItem value="OPEN">Open (Students can apply)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Any specific notes or description for this cycle..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Award Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="25000"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxRecipients">Available Slots *</Label>
                <Input
                  id="maxRecipients"
                  type="number"
                  placeholder="50"
                  value={formData.maxRecipients}
                  onChange={(e) => handleInputChange('maxRecipients', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Application Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicationStartDate">Application Start Date *</Label>
                <Input
                  id="applicationStartDate"
                  type="date"
                  value={formData.applicationStartDate}
                  onChange={(e) => handleInputChange('applicationStartDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Users className="w-5 h-5" />
              Eligibility Criteria
            </h3>

            <div className="space-y-4">
              {formData.criteria.map((criterion, index) => (
                <div key={criterion.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Criterion {index + 1}</h4>
                    {formData.criteria.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(criterion.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Criteria Type</Label>
                      <Select
                        value={criterion.type}
                        onValueChange={(value) => updateCriteria(criterion.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {criteriaTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Value/Requirement</Label>
                      <Input
                        placeholder={
                          criterion.type === 'MIN_GPA' ? 'e.g., 3.0' :
                          criterion.type === 'NATIONALITY' ? 'e.g., Zimbabwean, Kenyan' :
                          criterion.type === 'GENDER' ? 'e.g., FEMALE, MALE' :
                          criterion.type === 'ACADEMIC_LEVEL' ? 'e.g., UNDERGRADUATE, MASTERS' :
                          'Enter requirement...'
                        }
                        value={criterion.value}
                        onChange={(e) => updateCriteria(criterion.id, 'value', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`mandatory-${criterion.id}`}
                      checked={criterion.isMandatory}
                      onCheckedChange={(checked) => updateCriteria(criterion.id, 'isMandatory', checked)}
                    />
                    <Label htmlFor={`mandatory-${criterion.id}`}>
                      This is a mandatory requirement
                    </Label>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addCriteria}
                className="w-full"
              >
                Add Another Criterion
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="au-btn-primary">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Cycle
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}