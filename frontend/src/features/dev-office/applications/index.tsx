import { useState, useEffect } from 'react'
import { useSearch, Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Download,
  Star,
  GraduationCap,
  MessageSquare,
  Award,
  AlertCircle,
  TrendingUp,
  Users,
  ArrowLeft
} from 'lucide-react'

interface Application {
  id: string
  applicantName: string
  studentId: string
  email: string
  scholarshipName: string
  scholarshipId: string
  academicLevel: 'UNDERGRADUATE' | 'MASTERS' | 'PHD'
  gpa: number
  nationality: string
  program: string
  yearOfStudy: number
  appliedDate: string
  reviewDate?: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WAITLISTED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  reviewScore?: number
  reviewerNotes?: string
  documentsCount: number
  requiresInterview: boolean
}

const mockApplications: Application[] = [
  {
    id: 'APP-2025-001',
    applicantName: 'Tafadzwa Mukamuri',
    studentId: 'AU/UG/2023/1234',
    email: 'tmukamuri@student.africau.edu',
    scholarshipName: 'Africa University Excellence Award',
    scholarshipId: 'SCH-001',
    academicLevel: 'UNDERGRADUATE',
    gpa: 3.8,
    nationality: 'Zimbabwean',
    program: 'Computer Science',
    yearOfStudy: 2,
    appliedDate: '2025-01-10',
    status: 'PENDING',
    priority: 'HIGH',
    documentsCount: 5,
    requiresInterview: true
  },
  {
    id: 'APP-2025-002',
    applicantName: 'Amara Okafor',
    studentId: 'AU/PG/2024/5678',
    email: 'aokafor@student.africau.edu',
    scholarshipName: 'STEM Innovation Scholarship',
    scholarshipId: 'SCH-002',
    academicLevel: 'MASTERS',
    gpa: 3.9,
    nationality: 'Nigerian',
    program: 'Engineering',
    yearOfStudy: 1,
    appliedDate: '2025-01-08',
    reviewDate: '2025-01-12',
    status: 'UNDER_REVIEW',
    priority: 'HIGH',
    reviewScore: 85,
    documentsCount: 6,
    requiresInterview: true
  },
  {
    id: 'APP-2025-003',
    applicantName: 'Grace Mwangi',
    studentId: 'AU/UG/2022/9012',
    email: 'gmwangi@student.africau.edu',
    scholarshipName: 'Women in Leadership Grant',
    scholarshipId: 'SCH-003',
    academicLevel: 'UNDERGRADUATE',
    gpa: 3.7,
    nationality: 'Kenyan',
    program: 'Business Administration',
    yearOfStudy: 3,
    appliedDate: '2025-01-05',
    reviewDate: '2025-01-10',
    status: 'APPROVED',
    priority: 'MEDIUM',
    reviewScore: 92,
    documentsCount: 4,
    requiresInterview: false
  },
  {
    id: 'APP-2025-004',
    applicantName: 'Joseph Banda',
    studentId: 'AU/PHD/2023/3456',
    email: 'jbanda@student.africau.edu',
    scholarshipName: 'Rural Development Scholarship',
    scholarshipId: 'SCH-004',
    academicLevel: 'PHD',
    gpa: 3.6,
    nationality: 'Zambian',
    program: 'Agriculture',
    yearOfStudy: 2,
    appliedDate: '2024-12-28',
    reviewDate: '2025-01-03',
    status: 'WAITLISTED',
    priority: 'MEDIUM',
    reviewScore: 78,
    documentsCount: 7,
    requiresInterview: true
  },
  {
    id: 'APP-2025-005',
    applicantName: 'Sarah Macharia',
    studentId: 'AU/UG/2021/7890',
    email: 'smacharia@student.africau.edu',
    scholarshipName: 'STEM Innovation Scholarship',
    scholarshipId: 'SCH-002',
    academicLevel: 'UNDERGRADUATE',
    gpa: 3.2,
    nationality: 'Kenyan',
    program: 'Engineering',
    yearOfStudy: 4,
    appliedDate: '2024-12-20',
    reviewDate: '2024-12-30',
    status: 'REJECTED',
    priority: 'LOW',
    reviewScore: 65,
    reviewerNotes: 'GPA below minimum requirement for this scholarship',
    documentsCount: 3,
    requiresInterview: false
  }
]

export default function Applications() {
  const search = useSearch({ from: '/_authenticated/dev-office/applications/' })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [scholarshipFilter, setScholarshipFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  // Get scholarship ID from URL search params
  const scholarshipIdFromUrl = (search as any)?.scholarshipId

  // Set initial scholarship filter from URL
  useEffect(() => {
    if (scholarshipIdFromUrl && scholarshipIdFromUrl !== 'all') {
      setScholarshipFilter(scholarshipIdFromUrl)
    }
  }, [scholarshipIdFromUrl])

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.scholarshipName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesScholarship = scholarshipFilter === 'all' || app.scholarshipId === scholarshipFilter
    const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesScholarship && matchesPriority
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />
      case 'UNDER_REVIEW': return <Eye className="w-4 h-4 text-blue-500" />
      case 'WAITLISTED': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'PENDING': return <AlertCircle className="w-4 h-4 text-gray-500" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'au-badge au-badge-success'
      case 'REJECTED':
        return 'au-badge au-badge-error'
      case 'UNDER_REVIEW':
        return 'au-badge au-badge-primary'
      case 'WAITLISTED':
        return 'au-badge au-badge-warning'
      case 'PENDING':
        return 'au-badge au-badge-secondary'
      default:
        return 'au-badge'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'au-badge au-badge-error'
      case 'MEDIUM':
        return 'au-badge au-badge-warning'
      case 'LOW':
        return 'au-badge au-badge-secondary'
      default:
        return 'au-badge'
    }
  }

  const uniqueScholarships = [...new Set(mockApplications.map(app => ({ id: app.scholarshipId, name: app.scholarshipName })))]

  // Get the current scholarship name if filtering by one
  const currentScholarship = uniqueScholarships.find(s => s.id === scholarshipFilter)
  const isFilteringByScholarship = scholarshipFilter !== 'all' && currentScholarship

  // Filter applications for the current view
  const applicationsForStats = isFilteringByScholarship
    ? mockApplications.filter(app => app.scholarshipId === scholarshipFilter)
    : mockApplications

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
                <div>
                  {isFilteringByScholarship && (
                    <div className="mb-3">
                      <Link to="/dev-office/applications">
                        <Button variant="ghost" size="sm" className="text-gray-600 p-0 h-auto">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to All Applications
                        </Button>
                      </Link>
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {isFilteringByScholarship
                      ? `Applications for ${currentScholarship.name}`
                      : 'Application Review'
                    }
                  </h1>
                  <p className="text-gray-600">
                    {isFilteringByScholarship
                      ? `Review applications specifically for the ${currentScholarship.name} scholarship`
                      : 'Review and process scholarship applications from students'
                    }
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export Applications
                  </Button>
                  <Button className="au-btn-primary flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Batch Actions
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="au-stat-section au-section-gray-textured">
            <div className="container mx-auto">
              <div className="au-stat-grid">
                <div className="au-stat-item">
                  <span className="au-stat-number">{applicationsForStats.filter(app => app.status === 'PENDING').length}</span>
                  <span className="au-stat-label">Pending Review</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{applicationsForStats.filter(app => app.status === 'UNDER_REVIEW').length}</span>
                  <span className="au-stat-label">Under Review</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{applicationsForStats.filter(app => app.status === 'APPROVED').length}</span>
                  <span className="au-stat-label">Approved</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{applicationsForStats.length}</span>
                  <span className="au-stat-label">{isFilteringByScholarship ? 'Applications for This Scholarship' : 'Total Applications'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-8 py-8">
            {/* Priority Applications */}
            <div className="mb-8">
              <div className="au-section-header mb-6">
                <h2 className="text-2xl font-bold text-gray-800">High Priority Applications</h2>
              </div>
              <div className="au-grid au-grid-3">
                {applicationsForStats
                  .filter(app => app.priority === 'HIGH' && app.status === 'PENDING')
                  .slice(0, 3)
                  .map((app) => (
                    <PatternWrapper key={app.id} pattern="dots" className="au-card">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <User className="w-8 h-8 text-blue-600" />
                            <div>
                              <h4 className="font-bold text-lg">{app.applicantName}</h4>
                              <p className="text-sm text-gray-600">{app.studentId}</p>
                            </div>
                          </div>
                          <Badge className="au-badge au-badge-error">HIGH</Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Scholarship</span>
                            <span className="text-sm font-medium">{app.scholarshipName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">GPA</span>
                            <span className="text-sm font-bold">{app.gpa}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Program</span>
                            <span className="text-sm font-medium">{app.program}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Applied</span>
                            <span className="text-sm font-medium">{app.appliedDate}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                          <Button size="sm" className="flex-1 au-btn-primary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </PatternWrapper>
                  ))}
              </div>
            </div>

            {/* Filters */}
            <PatternWrapper pattern="geometric" className="au-card mb-6">
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={scholarshipFilter} onValueChange={setScholarshipFilter}>
                    <SelectTrigger className="w-[200px]">
                      <Award className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Scholarship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scholarships</SelectItem>
                      {uniqueScholarships.map(scholarship => (
                        <SelectItem key={scholarship.id} value={scholarship.id}>
                          {scholarship.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PatternWrapper>

            {/* Applications Table */}
            <PatternWrapper pattern="grid" className="au-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">All Applications</h3>
                  <div className="text-sm text-gray-600">
                    {filteredApplications.length} of {mockApplications.length} applications
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Scholarship</TableHead>
                        <TableHead>Academic Info</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <User className="w-8 h-8 text-gray-400" />
                              <div>
                                <div className="font-semibold">{app.applicantName}</div>
                                <div className="text-xs text-gray-500">{app.studentId}</div>
                                <div className="text-xs text-gray-500">{app.nationality}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{app.scholarshipName}</div>
                              <div className="text-xs text-gray-500">ID: {app.scholarshipId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-gray-400" />
                                <span className="text-sm font-medium">{app.academicLevel}</span>
                              </div>
                              <div className="text-xs text-gray-500">{app.program}</div>
                              <div className="text-xs text-gray-500">Year {app.yearOfStudy} • GPA: {app.gpa}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-sm">{app.appliedDate}</span>
                            </div>
                            {app.reviewDate && (
                              <div className="text-xs text-gray-500">
                                Reviewed: {app.reviewDate}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(app.status)}
                              <span className={getStatusBadge(app.status)}>
                                {app.status.replace('_', ' ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={getPriorityBadge(app.priority)}>
                              {app.priority}
                            </span>
                          </TableCell>
                          <TableCell>
                            {app.reviewScore ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="font-medium">{app.reviewScore}/100</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSelectedApplication(app)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Documents
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Add Comment
                                </DropdownMenuItem>
                                {app.status === 'PENDING' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </PatternWrapper>
          </div>

          {/* Application Detail Modal */}
          {selectedApplication && (
            <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Application Details</DialogTitle>
                  <DialogDescription>
                    Review detailed information for {selectedApplication.applicantName}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Student Name</label>
                      <p className="font-semibold">{selectedApplication.applicantName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Student ID</label>
                      <p className="font-semibold">{selectedApplication.studentId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="font-semibold">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nationality</label>
                      <p className="font-semibold">{selectedApplication.nationality}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Academic Level</label>
                      <p className="font-semibold">{selectedApplication.academicLevel}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Program</label>
                      <p className="font-semibold">{selectedApplication.program}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Year of Study</label>
                      <p className="font-semibold">{selectedApplication.yearOfStudy}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">GPA</label>
                      <p className="font-semibold">{selectedApplication.gpa}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Scholarship Applied For</label>
                    <p className="font-semibold">{selectedApplication.scholarshipName}</p>
                  </div>
                  {selectedApplication.reviewerNotes && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Reviewer Notes</label>
                      <p className="text-sm bg-gray-50 p-3 rounded">{selectedApplication.reviewerNotes}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                    Close
                  </Button>
                  {selectedApplication.status === 'PENDING' && (
                    <>
                      <Button variant="outline" className="text-red-600 border-red-600">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button className="au-btn-primary">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </Main>
    </>
  )
}