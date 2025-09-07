import { useState } from 'react'
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
  HelpCircle
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Link, useNavigate } from '@tanstack/react-router'

interface ScholarshipCriteria {
  id: string
  type: string
  value: string
  isMandatory: boolean
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
  const [formData, setFormData] = useState({
    // Program-level data
    name: '',
    description: '',
    sponsorId: '',
    currency: 'USD',
    disbursementSchedule: 'SEMESTER',
    startYear: '2025',
    endYear: '',
    maxYearsPerStudent: '1',
    status: 'DRAFT',
    // First cycle data (will become template for future cycles)
    academicYear: '2025-2026',
    amount: '',
    totalSlots: '',
    applicationStartDate: '',
    applicationEndDate: '',
    durationMonths: '12'
  })

  const [criteria, setCriteria] = useState<ScholarshipCriteria[]>([
    {
      id: '1',
      type: 'MIN_GPA',
      value: '3.0',
      isMandatory: true
    }
  ])

  const handleInputChange = (field: string, value: any) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Scholarship Data:', formData)
    console.log('Criteria:', criteria)
    
    // The API will:
    // 1. Create the scholarship program
    // 2. Automatically create the first cycle using the form data
    // 3. Set the first cycle's data as template defaults for future cycles
    
    // Example API call structure:
    // POST /api/scholarships
    // Body: { 
    //   program: {name, description, currency, etc.}, 
    //   firstCycle: {academicYear, amount, slots, dates},
    //   criteria 
    // }
    
    // navigate({ to: '/dev-office/scholarships' })
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Scholarship</h1>
                    <p className="text-gray-600">Set up a new scholarship program with detailed criteria</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="container mx-auto px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Provide the fundamental details about the scholarship program.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <FieldTooltip content="The official name of the scholarship program. This will be displayed to students and used in all communications. Choose a clear, descriptive name that reflects the scholarship's purpose.">
                        <Label htmlFor="name">Scholarship Name *</Label>
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
                      <FieldTooltip content="The academic year for the first cycle of this scholarship. Future cycles can be created later from the cycle management page.">
                        <Label htmlFor="academicYear">Academic Year *</Label>
                      </FieldTooltip>
                      <Input
                        id="academicYear"
                        placeholder="e.g., 2025-2026"
                        value={formData.academicYear}
                        onChange={(e) => handleInputChange('academicYear', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldTooltip content="A detailed description of the scholarship program including its purpose, goals, and what makes recipients eligible. This information helps students understand if they should apply and what the scholarship supports.">
                      <Label htmlFor="description">Description</Label>
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

              {/* Financial Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Details
                  </CardTitle>
                  <CardDescription>
                    Set the funding amount and disbursement schedule.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <FieldTooltip content="The total monetary value each student will receive through this scholarship. This will be used for the first cycle and as a template for future cycles.">
                        <Label htmlFor="amount">Award Amount *</Label>
                      </FieldTooltip>
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
                      <FieldTooltip content="The currency in which the scholarship amount will be paid. This affects how students budget and understand the value. USD is commonly used for international scholarships.">
                        <Label htmlFor="currency">Currency</Label>
                      </FieldTooltip>
                      <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
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
                      <FieldTooltip content="How often payments are made to students. 'Per Semester' is common for academic scholarships, 'Monthly' provides steady support, 'Annual' requires careful student budgeting. This affects cash flow and student financial planning.">
                        <Label htmlFor="disbursementSchedule">Disbursement Schedule</Label>
                      </FieldTooltip>
                      <Select value={formData.disbursementSchedule} onValueChange={(value) => handleInputChange('disbursementSchedule', value)}>
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
                  </div>
                </CardContent>
              </Card>

              {/* Capacity & Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Capacity & Timeline
                  </CardTitle>
                  <CardDescription>
                    Define the number of recipients and program duration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <FieldTooltip content="The maximum number of students who can receive this scholarship. This will be used for the first cycle and as a template for future cycles.">
                        <Label htmlFor="totalSlots">Available Slots *</Label>
                      </FieldTooltip>
                      <Input
                        id="totalSlots"
                        type="number"
                        placeholder="50"
                        value={formData.totalSlots}
                        onChange={(e) => handleInputChange('totalSlots', e.target.value)}
                        required
                      />
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <FieldTooltip content="When students can begin applying for this scholarship. Consider academic calendar and processing time.">
                        <Label htmlFor="applicationStartDate">Application Start Date *</Label>
                      </FieldTooltip>
                      <Input
                        id="applicationStartDate"
                        type="date"
                        value={formData.applicationStartDate}
                        onChange={(e) => handleInputChange('applicationStartDate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldTooltip content="Final deadline for scholarship applications. Allow time for review, interviews, and decision communication.">
                        <Label htmlFor="applicationEndDate">Application End Date *</Label>
                      </FieldTooltip>
                      <Input
                        id="applicationEndDate"
                        type="date"
                        value={formData.applicationEndDate}
                        onChange={(e) => handleInputChange('applicationEndDate', e.target.value)}
                        required
                      />
                    </div>
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
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start space-x-2">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Automatic Cycle Management</p>
                            <p>
                              When you create this scholarship, the system will:
                              <br />• Create the first cycle for {initialCycle.academicYear}
                              <br />• Automatically generate the next cycle (2026-2027) using your template settings
                              <br />• Continue creating cycles each year until the end date (if specified)
                              <br />• Allow you to adjust individual cycles as needed
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
                    Define who can apply for this scholarship.
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

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Link to="/dev-office/scholarships">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="au-btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Create Scholarship
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Main>
    </>
  )
}