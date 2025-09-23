import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Target,
  Info,
  HelpCircle,
  Loader2
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCreateScholarship } from '@/hooks/use-scholarships'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface ScholarshipCriteria {
  id: string
  type: string
  value: string
  isMandatory: boolean
}

interface Sponsor {
  id: string
  name: string
  type: string
  isActive: boolean
}

const FieldTooltip = ({ content, children }: { content: string; children: React.ReactNode }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          {children}
          <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export default function CreateScholarship() {
  const navigate = useNavigate()
  const createScholarshipMutation = useCreateScholarship()

  // Fetch sponsors for selection
  const { data: sponsors = [] } = useQuery<Sponsor[]>({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const response = await apiClient.get<Sponsor[]>('/sponsors');
      return response;
    }
  });

  const [formData, setFormData] = useState({
    // Program-level data only
    name: '',
    description: '',
    sponsorId: '',
    defaultCurrency: 'USD',
    defaultDisbursementSchedule: 'SEMESTER',
    defaultScholarshipType: 'MERIT_BASED',
    startYear: '2025',
    endYear: '',
    maxYearsPerStudent: '1',
    isRecurring: false,
    // Template defaults for cycles
    defaultAmount: '',
    defaultSlots: '',
    defaultAppStartMonth: '4',
    defaultAppStartDay: '1',
    defaultAppEndMonth: '6',
    defaultAppEndDay: '30',
    // First cycle creation flag
    createFirstCycle: false,
    // First cycle inheritance flags
    inheritAmount: true,
    inheritSlots: true,
    inheritDates: true,
    inheritCriteria: true,
    // First cycle specific data (only used if createFirstCycle is true)
    firstCycleAcademicYear: '2025-2026',
    firstCycleAmount: '',
    firstCycleSlots: '',
    firstCycleStartDate: '',
    firstCycleEndDate: ''
  })

  const [criteria, setCriteria] = useState<ScholarshipCriteria[]>([
    {
      id: '1',
      type: 'MIN_GPA',
      value: '3.0',
      isMandatory: true
    }
  ])

  const [firstCycleCriteria, setFirstCycleCriteria] = useState<ScholarshipCriteria[]>([
    {
      id: '1',
      type: 'MIN_GPA',
      value: '3.0',
      isMandatory: true
    }
  ])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      }

      // Auto-populate first cycle fields when checkbox is checked and defaults are available
      if (field === 'createFirstCycle' && value === true) {
        if (prev.inheritAmount && prev.defaultAmount && !prev.firstCycleAmount) {
          updated.firstCycleAmount = prev.defaultAmount
        }
        if (prev.inheritSlots && prev.defaultSlots && !prev.firstCycleSlots) {
          updated.firstCycleSlots = prev.defaultSlots
        }
        // Copy program criteria to first cycle criteria if inherit is enabled
        if (prev.inheritCriteria && firstCycleCriteria.length === 1 && firstCycleCriteria[0].value === '3.0') {
          setFirstCycleCriteria([...criteria])
        }
      }

      // Handle inheritance flag changes
      if (field === 'inheritAmount') {
        if (value === true && prev.defaultAmount) {
          updated.firstCycleAmount = prev.defaultAmount
        } else if (value === false) {
          updated.firstCycleAmount = ''
        }
      }

      if (field === 'inheritSlots') {
        if (value === true && prev.defaultSlots) {
          updated.firstCycleSlots = prev.defaultSlots
        } else if (value === false) {
          updated.firstCycleSlots = ''
        }
      }

      if (field === 'inheritCriteria') {
        if (value === true) {
          setFirstCycleCriteria([...criteria])
        } else {
          // Reset to default single criterion
          setFirstCycleCriteria([{
            id: Date.now().toString(),
            type: 'MIN_GPA',
            value: '3.0',
            isMandatory: true
          }])
        }
      }

      // Auto-update first cycle amount when default amount changes (if inheritance is enabled)
      if (field === 'defaultAmount' && prev.createFirstCycle && prev.inheritAmount) {
        updated.firstCycleAmount = value
      }

      // Auto-update first cycle slots when default slots changes (if inheritance is enabled)
      if (field === 'defaultSlots' && prev.createFirstCycle && prev.inheritSlots) {
        updated.firstCycleSlots = value
      }

      // Auto-update first cycle criteria when program criteria changes (if inheritance is enabled)
      // This will be handled by useEffect for criteria changes

      return updated
    })
  }

  const addCriteria = () => {
    const newCriteria: ScholarshipCriteria = {
      id: Date.now().toString(),
      type: 'NATIONALITY',
      value: '',
      isMandatory: true
    }
    setCriteria(prev => [...prev, newCriteria])
  }

  const updateCriteria = (id: string, field: string, value: any) => {
    setCriteria(prev =>
      prev.map(c => c.id === id ? { ...c, [field]: value } : c)
    )
  }

  const removeCriteria = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id))
  }

  // First cycle criteria functions
  const addFirstCycleCriteria = () => {
    const newCriteria: ScholarshipCriteria = {
      id: Date.now().toString(),
      type: 'NATIONALITY',
      value: '',
      isMandatory: true
    }
    setFirstCycleCriteria(prev => [...prev, newCriteria])
  }

  const updateFirstCycleCriteria = (id: string, field: string, value: any) => {
    setFirstCycleCriteria(prev =>
      prev.map(c => c.id === id ? { ...c, [field]: value } : c)
    )
  }

  const removeFirstCycleCriteria = (id: string) => {
    setFirstCycleCriteria(prev => prev.filter(c => c.id !== id))
  }

  // Sync criteria when program criteria changes and inheritance is enabled
  useEffect(() => {
    if (formData.createFirstCycle && formData.inheritCriteria) {
      setFirstCycleCriteria([...criteria])
    }
  }, [criteria, formData.createFirstCycle, formData.inheritCriteria])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.sponsorId) {
      toast.error('Please select a sponsor for this scholarship.')
      return
    }

    if (!formData.defaultAmount) {
      toast.error('Please specify a default award amount.')
      return
    }

    if (!formData.defaultSlots) {
      toast.error('Please specify default available slots.')
      return
    }

    // Enhanced validation for first cycle if enabled
    if (formData.createFirstCycle) {
      if (!formData.firstCycleAcademicYear) {
        toast.error('Please specify the academic year for the first cycle.')
        return
      }

      // Validate amount (either inherited or custom)
      if (!formData.inheritAmount && !formData.firstCycleAmount) {
        toast.error('Please specify the award amount for the first cycle or use default amount.')
        return
      }
      if (formData.inheritAmount && !formData.defaultAmount) {
        toast.error('Cannot inherit amount - no default amount specified.')
        return
      }

      // Validate slots (either inherited or custom)
      if (!formData.inheritSlots && !formData.firstCycleSlots) {
        toast.error('Please specify available slots for the first cycle or use default slots.')
        return
      }
      if (formData.inheritSlots && !formData.defaultSlots) {
        toast.error('Cannot inherit slots - no default slots specified.')
        return
      }

      // Validate dates (either inherited or custom)
      if (!formData.inheritDates) {
        if (!formData.firstCycleStartDate) {
          toast.error('Please specify the application start date for the first cycle.')
          return
        }
        if (!formData.firstCycleEndDate) {
          toast.error('Please specify the application end date for the first cycle.')
          return
        }
        if (new Date(formData.firstCycleStartDate) >= new Date(formData.firstCycleEndDate)) {
          toast.error('Application start date must be before the end date.')
          return
        }
      }

      // Validate criteria (either inherited or custom)
      if (!formData.inheritCriteria) {
        const invalidCriteria = firstCycleCriteria.find(c => !c.value.trim())
        if (invalidCriteria) {
          toast.error('Please provide values for all first cycle eligibility criteria.')
          return
        }
      }
    }

    // Additional frontend validations
    if (!formData.name.trim()) {
      toast.error('Please provide a program name.')
      return
    }

    if (formData.startYear && formData.endYear && Number(formData.startYear) >= Number(formData.endYear)) {
      toast.error('Program start year must be before end year.')
      return
    }

    if (!formData.defaultAmount || Number(formData.defaultAmount) <= 0 || isNaN(Number(formData.defaultAmount))) {
      toast.error('Default award amount must be greater than 0.')
      return
    }

    if (!formData.defaultSlots || Number(formData.defaultSlots) <= 0 || isNaN(Number(formData.defaultSlots))) {
      toast.error('Default available slots must be greater than 0.')
      return
    }

    if (!formData.maxYearsPerStudent || Number(formData.maxYearsPerStudent) <= 0 || isNaN(Number(formData.maxYearsPerStudent))) {
      toast.error('Max years per student must be greater than 0.')
      return
    }

    // Validate program criteria
    const invalidProgramCriteria = criteria.find(c => !c.value.trim())
    if (invalidProgramCriteria) {
      toast.error('Please provide values for all program eligibility criteria.')
      return
    }

    try {
      // Find selected sponsor details
      const selectedSponsor = sponsors.find(s => s.id === formData.sponsorId)

      // If creating first cycle, create a simple scholarship object that matches the DTO
      if (formData.createFirstCycle) {
        // Calculate effective values based on inheritance flags
        const effectiveAmount = formData.inheritAmount ? Number(formData.defaultAmount) : Number(formData.firstCycleAmount)
        const effectiveSlots = formData.inheritSlots ? Number(formData.defaultSlots) : Number(formData.firstCycleSlots)
        const effectiveCriteria = formData.inheritCriteria ? criteria : firstCycleCriteria

        // Calculate effective dates
        let effectiveStartDate = formData.firstCycleStartDate
        let effectiveEndDate = formData.firstCycleEndDate

        if (formData.inheritDates) {
          // Generate dates based on default months and current academic year
          const currentYear = new Date().getFullYear()
          const startMonth = Number(formData.defaultAppStartMonth) - 1 // JS months are 0-indexed
          const endMonth = Number(formData.defaultAppEndMonth) - 1
          const startDay = Number(formData.defaultAppStartDay)
          const endDay = Number(formData.defaultAppEndDay)

          effectiveStartDate = new Date(currentYear, startMonth, startDay).toISOString().split('T')[0]
          effectiveEndDate = new Date(currentYear, endMonth, endDay).toISOString().split('T')[0]
        }

        // Create scholarship data that matches CreateScholarshipDto
        const scholarshipData = {
          name: formData.name,
          description: formData.description,
          amount: effectiveAmount,
          sponsor: selectedSponsor?.name || 'Unknown Sponsor',
          sponsorId: formData.sponsorId,
          type: formData.defaultScholarshipType,
          applicationStartDate: effectiveStartDate,
          applicationDeadline: effectiveEndDate,
          eligibilityCriteria: effectiveCriteria.map(c => c.value),
          maxRecipients: effectiveSlots,
          status: 'DRAFT'
        }

        await createScholarshipMutation.mutateAsync(scholarshipData)
      } else {
        // For program-only creation, we need to handle this differently
        // For now, create a basic scholarship template
        const scholarshipData = {
          name: formData.name,
          description: formData.description,
          amount: Number(formData.defaultAmount),
          sponsor: selectedSponsor?.name || 'Unknown Sponsor',
          sponsorId: formData.sponsorId,
          type: formData.defaultScholarshipType,
          applicationStartDate: '2025-04-01',
          applicationDeadline: '2025-06-30',
          eligibilityCriteria: criteria.map(c => c.value),
          maxRecipients: Number(formData.defaultSlots),
          status: 'DRAFT'
        }

        await createScholarshipMutation.mutateAsync(scholarshipData)
      }

      const successMessage = formData.createFirstCycle
        ? 'Scholarship program and first cycle created successfully!'
        : 'Scholarship program created successfully!'

      toast.success(successMessage)
      navigate({ to: '/dev-office/scholarships' })
    } catch (error: any) {
      console.error('Error creating scholarship:', error)
      toast.error(error.message || 'Failed to create scholarship. Please try again.')
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

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header 
        style={{ background: 'linear-gradient(135deg, #c20000 0%, #8b0000 100%)' }}
        className="[&_button]:text-white [&_button]:hover:text-white/80 [&_button]:hover:bg-white/10 [&_button]:bg-transparent [&_svg]:text-white [&_img]:border-white/20 [&_.border-r]:border-white/20 [&_[data-slot='sidebar-trigger']]:bg-transparent [&_[data-slot='sidebar-trigger']]:hover:bg-white/10 [&_[data-slot='sidebar-trigger']]:text-white"
      >
        <div></div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main className="p-0">
        <div className="au-showcase">
          {/* Page Header */}
          <div className="au-hero-gradient py-8 px-8">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link to="/dev-office/scholarships">
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Scholarships
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Scholarship Program</h1>
                    <p className="text-gray-600">Set up the master template for a scholarship program. Individual application cycles will be created separately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="container mx-auto px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Program vs Cycle Explanation */}
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <Info className="w-5 h-5" />
                    Understanding Programs vs Cycles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-red-800 space-y-3">
                    <p className="font-medium">What you're creating here:</p>
                    <div className="ml-4 space-y-2">
                      <p>📋 <strong>Scholarship Program</strong> - The master template (e.g., "AU Excellence Scholarship")</p>
                      <p className="text-sm ml-6">• Contains sponsor information, basic criteria, and default settings</p>
                      <p className="text-sm ml-6">• Runs for multiple years with consistent rules</p>
                    </div>

                    <p className="font-medium mt-4">What happens after:</p>
                    <div className="ml-4 space-y-2">
                      <p>📅 <strong>Application Cycles</strong> - Yearly instances for students to apply</p>
                      <p className="text-sm ml-6">• Each cycle is for a specific academic year (e.g., "2025-2026")</p>
                      <p className="text-sm ml-6">• Has specific dates, amounts, and available slots</p>
                      <p className="text-sm ml-6">• Created separately after the program is established</p>
                    </div>

                    <div className="bg-white p-3 rounded border border-red-300 mt-4">
                      <p className="text-sm">💡 <strong>Next Steps:</strong> You can either create just the program template, or optionally create the first application cycle at the same time using the option below.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Program Information
                  </CardTitle>
                  <CardDescription>
                    Provide the fundamental details about the scholarship program. This creates the master template that will be used for all future application cycles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <FieldTooltip content="The official name of the scholarship program. This will be displayed to students and used in all communications. Choose a clear, descriptive name that reflects the scholarship's purpose.">
                      <Label htmlFor="name">Program Name *</Label>
                    </FieldTooltip>
                    <Input
                      id="name"
                      placeholder="e.g., Africa University Excellence Award"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldTooltip content="Select the organization or individual sponsoring this scholarship. The sponsor provides the funding and may have specific requirements or preferences for recipient selection.">
                      <Label htmlFor="sponsorId">Sponsor *</Label>
                    </FieldTooltip>
                    <Select
                      value={formData.sponsorId}
                      onValueChange={(value) => handleInputChange('sponsorId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sponsor" />
                      </SelectTrigger>
                      <SelectContent>
                        {sponsors.filter(sponsor => sponsor.isActive).map(sponsor => (
                          <SelectItem key={sponsor.id} value={sponsor.id}>
                            <div className="flex items-center gap-2">
                              <span>{sponsor.name}</span>
                              <span className="text-xs text-gray-500">({sponsor.type})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {sponsors.length === 0 && (
                      <p className="text-sm text-amber-600">
                        No active sponsors found. Please <Link to="/dev-office/sponsors" className="underline">create a sponsor</Link> first.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <FieldTooltip content="A detailed description of the scholarship program including its purpose, goals, and what makes recipients eligible. This information helps students understand if they should apply and what the scholarship supports.">
                      <Label htmlFor="description">Program Description</Label>
                    </FieldTooltip>
                    <Textarea
                      id="description"
                      placeholder="Describe the scholarship program, its purpose, and target recipients..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Template Defaults */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Default Settings for Cycles
                  </CardTitle>
                  <CardDescription>
                    Set the default values that will be used when creating new application cycles. These can be adjusted for individual cycles later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <FieldTooltip content="The default monetary value each student will receive. This amount will be used as the starting value when creating new cycles, but can be adjusted for each cycle.">
                        <Label htmlFor="defaultAmount">Default Award Amount *</Label>
                      </FieldTooltip>
                      <Input
                        id="defaultAmount"
                        type="number"
                        placeholder="25000"
                        value={formData.defaultAmount}
                        onChange={(e) => handleInputChange('defaultAmount', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldTooltip content="The default currency for scholarship payments. Individual cycles can override this if needed.">
                        <Label htmlFor="defaultCurrency">Default Currency</Label>
                      </FieldTooltip>
                      <Select value={formData.defaultCurrency} onValueChange={(value) => handleInputChange('defaultCurrency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="ZWL">ZWL</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FieldTooltip content="The default payment schedule for students. Individual cycles can adjust this based on academic calendar or sponsor preferences.">
                        <Label htmlFor="defaultDisbursementSchedule">Default Disbursement Schedule</Label>
                      </FieldTooltip>
                      <Select value={formData.defaultDisbursementSchedule} onValueChange={(value) => handleInputChange('defaultDisbursementSchedule', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                          <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                          <SelectItem value="SEMESTER">Per Semester</SelectItem>
                          <SelectItem value="ANNUAL">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FieldTooltip content="The type of scholarship that determines the selection criteria and funding approach.">
                        <Label htmlFor="defaultScholarshipType">Default Scholarship Type</Label>
                      </FieldTooltip>
                      <Select value={formData.defaultScholarshipType} onValueChange={(value) => handleInputChange('defaultScholarshipType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MERIT_BASED">Merit-Based</SelectItem>
                          <SelectItem value="NEED_BASED">Need-Based</SelectItem>
                          <SelectItem value="FULL">Full Scholarship</SelectItem>
                          <SelectItem value="PARTIAL">Partial Scholarship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldTooltip content="The default number of students who can receive this scholarship per cycle. This helps with budget planning and can be adjusted for individual cycles.">
                      <Label htmlFor="defaultSlots">Default Available Slots *</Label>
                    </FieldTooltip>
                    <Input
                      id="defaultSlots"
                      type="number"
                      placeholder="50"
                      value={formData.defaultSlots}
                      onChange={(e) => handleInputChange('defaultSlots', e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Default Application Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Default Application Timeline
                  </CardTitle>
                  <CardDescription>
                    Set default application dates that will be used when creating cycles. These help maintain consistency across years.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <FieldTooltip content="Default month when applications open each year. Individual cycles can adjust the exact dates.">
                        <Label htmlFor="defaultAppStartMonth">Default Start Month</Label>
                      </FieldTooltip>
                      <Select value={formData.defaultAppStartMonth} onValueChange={(value) => handleInputChange('defaultAppStartMonth', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FieldTooltip content="Default month when applications close each year. Typically 2-3 months after opening to allow adequate application time.">
                        <Label htmlFor="defaultAppEndMonth">Default End Month</Label>
                      </FieldTooltip>
                      <Select value={formData.defaultAppEndMonth} onValueChange={(value) => handleInputChange('defaultAppEndMonth', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldTooltip content="How many consecutive years one student can receive this scholarship. '1' for single-year awards, '4' for full undergraduate support. This affects long-term budget planning and student retention support.">
                      <Label htmlFor="maxYearsPerStudent">Max Years per Student</Label>
                    </FieldTooltip>
                    <Input
                      id="maxYearsPerStudent"
                      type="number"
                      placeholder="1"
                      value={formData.maxYearsPerStudent}
                      onChange={(e) => handleInputChange('maxYearsPerStudent', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Multi-Year Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Multi-Year Tracking
                  </CardTitle>
                  <CardDescription>
                    Configure how this scholarship will be tracked over multiple years.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <FieldTooltip content="The year this scholarship program was first established. Used for historical tracking and impact analysis. For example, 'Africa University Scholarship' might have started in 2020 and supported 1000+ students by 2025.">
                        <Label htmlFor="startYear">Program Start Year *</Label>
                      </FieldTooltip>
                      <Input
                        id="startYear"
                        type="number"
                        placeholder="2025"
                        value={formData.startYear}
                        onChange={(e) => handleInputChange('startYear', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldTooltip content="When this scholarship program will end (optional). Leave empty for ongoing programs. Used for endowments with finite terms or pilot programs. Helps with sunset planning and long-term impact assessment.">
                        <Label htmlFor="endYear">Program End Year (Optional)</Label>
                      </FieldTooltip>
                      <Input
                        id="endYear"
                        type="number"
                        placeholder="2030 or leave empty for ongoing"
                        value={formData.endYear}
                        onChange={(e) => handleInputChange('endYear', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FieldTooltip content="Check this if applications open every year for new students. When enabled, the system automatically creates future cycles based on your template settings. This is recommended for programs like 'AU Scholarship' that run for multiple years.">
                        <Checkbox
                          id="isRecurring"
                          checked={formData.isRecurring}
                          onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                        />
                        <Label htmlFor="isRecurring">
                          Enable automatic yearly cycles
                        </Label>
                      </FieldTooltip>
                    </div>
                    
                    {formData.isRecurring && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-start space-x-2">
                          <Info className="w-4 h-4 text-red-600 mt-0.5" />
                          <div className="text-sm text-red-800">
                            <p className="font-semibold mb-1">Automatic Cycle Management</p>
                            <p>
                              When enabled, the system will:
                              <br />• Automatically create yearly cycles using your template settings
                              <br />• Use the default dates, amounts, and slots you've specified
                              <br />• Allow you to adjust individual cycles as needed
                              <br />• Continue creating cycles each year until the end date (if specified)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Eligibility Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Eligibility Criteria
                  </CardTitle>
                  <CardDescription>
                    Define the default eligibility criteria for this scholarship program. These will be used as templates for all cycles unless overridden.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {criteria.map((criterion, index) => (
                    <div key={criterion.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Criterion {index + 1}</h4>
                        {criteria.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCriteria(criterion.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <FieldTooltip content="The type of eligibility requirement. Examples: 'Minimum GPA' ensures academic performance, 'Nationality' targets specific countries, 'Gender' promotes diversity, 'Academic Level' focuses on degree type. Choose based on scholarship goals and sponsor requirements.">
                            <Label>Criteria Type</Label>
                          </FieldTooltip>
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
                          <FieldTooltip content="The specific requirement value. For GPA: use decimals (3.5). For nationality: use country names or 'African'. For gender: MALE, FEMALE, or OTHER. For academic level: UNDERGRADUATE, MASTERS, PHD. Be specific to ensure clear eligibility.">
                            <Label>Value/Requirement</Label>
                          </FieldTooltip>
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
                        <FieldTooltip content="Mandatory requirements MUST be met to apply (application rejected if not met). Optional requirements are preferred but not required (used for ranking candidates). Use mandatory sparingly to avoid excluding too many students.">
                          <Checkbox
                            id={`mandatory-${criterion.id}`}
                            checked={criterion.isMandatory}
                            onCheckedChange={(checked) => updateCriteria(criterion.id, 'isMandatory', checked)}
                          />
                          <Label htmlFor={`mandatory-${criterion.id}`}>
                            This is a mandatory requirement
                          </Label>
                        </FieldTooltip>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCriteria}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Criterion
                  </Button>
                </CardContent>
              </Card>

              {/* First Cycle Option */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    First Application Cycle
                  </CardTitle>
                  <CardDescription>
                    Optionally create the first application cycle along with the program.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="createFirstCycle"
                      checked={formData.createFirstCycle}
                      onCheckedChange={(checked) => handleInputChange('createFirstCycle', checked)}
                    />
                    <FieldTooltip content="Check this to create the first application cycle immediately. This allows students to start applying right away. If unchecked, you'll need to create cycles separately later.">
                      <Label htmlFor="createFirstCycle">
                        Create first application cycle now
                      </Label>
                    </FieldTooltip>
                  </div>

                  {formData.createFirstCycle && (
                    <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-medium text-gray-800">First Cycle Details</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstCycleAcademicYear">Academic Year *</Label>
                          <Input
                            id="firstCycleAcademicYear"
                            placeholder="e.g., 2025-2026"
                            value={formData.firstCycleAcademicYear}
                            onChange={(e) => handleInputChange('firstCycleAcademicYear', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="inheritAmount"
                              checked={formData.inheritAmount}
                              onCheckedChange={(checked) => handleInputChange('inheritAmount', checked)}
                            />
                            <Label htmlFor="inheritAmount" className="text-sm">
                              Use default amount ({formData.defaultAmount ? `${formData.defaultAmount} ${formData.defaultCurrency}` : 'not set'})
                            </Label>
                          </div>
                          {!formData.inheritAmount && (
                            <div className="space-y-2">
                              <Label htmlFor="firstCycleAmount">Custom Award Amount *</Label>
                              <Input
                                id="firstCycleAmount"
                                type="number"
                                placeholder="25000"
                                value={formData.firstCycleAmount}
                                onChange={(e) => handleInputChange('firstCycleAmount', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="inheritSlots"
                              checked={formData.inheritSlots}
                              onCheckedChange={(checked) => handleInputChange('inheritSlots', checked)}
                            />
                            <Label htmlFor="inheritSlots" className="text-sm">
                              Use default slots ({formData.defaultSlots || 'not set'})
                            </Label>
                          </div>
                          {!formData.inheritSlots && (
                            <div className="space-y-2">
                              <Label htmlFor="firstCycleSlots">Custom Available Slots *</Label>
                              <Input
                                id="firstCycleSlots"
                                type="number"
                                placeholder="50"
                                value={formData.firstCycleSlots}
                                onChange={(e) => handleInputChange('firstCycleSlots', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="inheritDates"
                            checked={formData.inheritDates}
                            onCheckedChange={(checked) => handleInputChange('inheritDates', checked)}
                          />
                          <Label htmlFor="inheritDates" className="text-sm">
                            Use default application dates (Month {formData.defaultAppStartMonth} - Month {formData.defaultAppEndMonth})
                          </Label>
                        </div>
                        {!formData.inheritDates && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstCycleStartDate">Custom Start Date *</Label>
                              <Input
                                id="firstCycleStartDate"
                                type="date"
                                value={formData.firstCycleStartDate}
                                onChange={(e) => handleInputChange('firstCycleStartDate', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="firstCycleEndDate">Custom End Date *</Label>
                              <Input
                                id="firstCycleEndDate"
                                type="date"
                                value={formData.firstCycleEndDate}
                                onChange={(e) => handleInputChange('firstCycleEndDate', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="inheritCriteria"
                              checked={formData.inheritCriteria}
                              onCheckedChange={(checked) => handleInputChange('inheritCriteria', checked)}
                            />
                            <Label htmlFor="inheritCriteria" className="text-sm font-medium">
                              Use program eligibility criteria ({criteria.length} criteria defined)
                            </Label>
                          </div>
                          {!formData.inheritCriteria && (
                            <div className="text-sm text-gray-600">
                              Define custom eligibility criteria for this first cycle only.
                            </div>
                          )}
                        </div>

                        {!formData.inheritCriteria && (
                          <div>
                            {firstCycleCriteria.map((criterion, index) => (
                          <div key={criterion.id} className="p-3 border rounded-lg space-y-3 bg-white">
                            <div className="flex items-center justify-between">
                              <h6 className="font-medium text-sm">Cycle Criterion {index + 1}</h6>
                              {firstCycleCriteria.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFirstCycleCriteria(criterion.id)}
                                  className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Criteria Type</Label>
                                <Select
                                  value={criterion.type}
                                  onValueChange={(value) => updateFirstCycleCriteria(criterion.id, 'type', value)}
                                >
                                  <SelectTrigger className="h-8">
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
                              <div className="space-y-1">
                                <Label className="text-xs">Value/Requirement</Label>
                                <Input
                                  className="h-8"
                                  placeholder={
                                    criterion.type === 'MIN_GPA' ? 'e.g., 3.0' :
                                    criterion.type === 'NATIONALITY' ? 'e.g., Zimbabwean, Kenyan' :
                                    criterion.type === 'GENDER' ? 'e.g., FEMALE, MALE' :
                                    criterion.type === 'ACADEMIC_LEVEL' ? 'e.g., UNDERGRADUATE, MASTERS' :
                                    'Enter requirement...'
                                  }
                                  value={criterion.value}
                                  onChange={(e) => updateFirstCycleCriteria(criterion.id, 'value', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`cycle-mandatory-${criterion.id}`}
                                checked={criterion.isMandatory}
                                onCheckedChange={(checked) => updateFirstCycleCriteria(criterion.id, 'isMandatory', checked)}
                              />
                              <Label htmlFor={`cycle-mandatory-${criterion.id}`} className="text-xs">
                                This is a mandatory requirement
                              </Label>
                            </div>
                          </div>
                        ))}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addFirstCycleCriteria}
                              className="w-full"
                            >
                              <Plus className="w-3 h-3 mr-2" />
                              Add Cycle Criterion
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          💡 <strong>Note:</strong> These values will override the default template settings for this first cycle only. Future cycles will use the template defaults unless manually adjusted.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Link to="/dev-office/scholarships">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="au-btn-primary"
                  disabled={createScholarshipMutation.isPending}
                >
                  {createScholarshipMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {formData.createFirstCycle ? 'Create Program & First Cycle' : 'Create Program'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Main>
    </>
  )
}