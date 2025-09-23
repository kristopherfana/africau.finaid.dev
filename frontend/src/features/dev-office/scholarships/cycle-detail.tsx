import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  Award,
  PieChart
} from 'lucide-react'
import { Link, useParams } from '@tanstack/react-router'
import { scholarshipsAPI } from '@/lib/api'

interface ScholarshipCycle {
  id: string
  name: string
  academicYear?: string
  amount: number
  maxRecipients: number
  currentApplications: number
  applicationStartDate: string
  applicationDeadline: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'SUSPENDED'
  sponsor: string
  description?: string
}

interface Application {
  id: string
  studentName: string
  studentEmail: string
  submittedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'
  gpa?: number
  program?: string
  year?: string
}

export default function ScholarshipCycleDetail() {
  const { id: programId, cycleId } = useParams({
    from: '/_authenticated/dev-office/scholarships/$id/cycles/$cycleId'
  })
  const [cycle, setCycle] = useState<ScholarshipCycle | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCycleDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch cycles for the program and find the specific cycle
        const cycles = await scholarshipsAPI.getCyclesByProgram(programId)
        const cycleData = cycles.find(cycle => cycle.id === cycleId)

        if (!cycleData) {
          throw new Error('Cycle not found')
        }

        // Convert to ScholarshipCycle format
        const nameMatch = cycleData.name.match(/(\d{4}-\d{4})/);
        const academicYear = nameMatch ? nameMatch[1] : new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);

        const convertedCycle: ScholarshipCycle = {
          id: cycleData.id,
          name: cycleData.name,
          academicYear,
          amount: cycleData.amount,
          maxRecipients: cycleData.maxRecipients,
          currentApplications: cycleData.currentApplications,
          applicationStartDate: new Date(cycleData.applicationStartDate).toISOString().split('T')[0],
          applicationDeadline: new Date(cycleData.applicationDeadline).toISOString().split('T')[0],
          status: cycleData.status,
          sponsor: cycleData.sponsor,
          description: cycleData.description
        }

        setCycle(convertedCycle)

        // Mock applications data (replace with actual API call)
        const mockApplications: Application[] = [
          {
            id: '1',
            studentName: 'Alice Mukamana',
            studentEmail: 'alice.mukamana@student.africau.edu',
            submittedAt: '2024-09-15T10:30:00Z',
            status: 'PENDING',
            gpa: 3.8,
            program: 'Computer Science',
            year: 'Year 3'
          },
          {
            id: '2',
            studentName: 'John Tendai',
            studentEmail: 'john.tendai@student.africau.edu',
            submittedAt: '2024-09-14T14:20:00Z',
            status: 'UNDER_REVIEW',
            gpa: 3.6,
            program: 'Business Administration',
            year: 'Year 2'
          },
          {
            id: '3',
            studentName: 'Mary Mbeki',
            studentEmail: 'mary.mbeki@student.africau.edu',
            submittedAt: '2024-09-13T09:15:00Z',
            status: 'APPROVED',
            gpa: 3.9,
            program: 'Engineering',
            year: 'Year 4'
          }
        ]
        setApplications(mockApplications)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cycle details')
      } finally {
        setLoading(false)
      }
    }

    fetchCycleDetails()
  }, [programId, cycleId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>
      case 'OPEN':
        return <Badge variant="default" className="bg-green-600">Open</Badge>
      case 'CLOSED':
        return <Badge variant="destructive">Closed</Badge>
      case 'SUSPENDED':
        return <Badge variant="outline">Suspended</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>
      case 'UNDER_REVIEW':
        return <Badge variant="default" className="bg-blue-600">Under Review</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getApplicationStats = () => {
    const total = applications.length
    const pending = applications.filter(app => app.status === 'PENDING').length
    const underReview = applications.filter(app => app.status === 'UNDER_REVIEW').length
    const approved = applications.filter(app => app.status === 'APPROVED').length
    const rejected = applications.filter(app => app.status === 'REJECTED').length

    return { total, pending, underReview, approved, rejected }
  }

  if (loading) {
    return (
      <>
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
        <Main className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cycle details...</p>
            </div>
          </div>
        </Main>
      </>
    )
  }

  if (error || !cycle) {
    return (
      <>
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
        <Main className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-2">Error loading cycle details</p>
              <p className="text-gray-600">{error || 'Cycle not found'}</p>
            </div>
          </div>
        </Main>
      </>
    )
  }

  const stats = getApplicationStats()
  const daysUntilDeadline = Math.ceil((new Date(cycle.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <>
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

      <Main className="p-0">
        <div className="au-showcase">
          {/* Page Header */}
          <div className="au-hero-gradient py-8 px-8">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link to={`/dev-office/scholarships/${programId}/cycles`}>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Cycles
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {cycle.name}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span>{cycle.academicYear}</span>
                      <span>•</span>
                      <span>Sponsored by {cycle.sponsor}</span>
                      <span>•</span>
                      {getStatusBadge(cycle.status)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    ${cycle.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Award Amount</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="container mx-auto px-8 py-6">
            <div className="au-grid au-grid-4 mb-8">
              <PatternWrapper pattern="dots" className="au-card">
                <div className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                  <div className="text-xs text-gray-500 mt-1">
                    of {cycle.maxRecipients} max recipients
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="geometric" className="au-card">
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-600" />
                  <div className="text-2xl font-bold">{stats.approved}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% approval rate
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="grid" className="au-card">
                <div className="p-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
                  <div className="text-2xl font-bold">{stats.pending + stats.underReview}</div>
                  <div className="text-sm text-gray-600">Pending Review</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.pending} new, {stats.underReview} in review
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="dots" className="au-card">
                <div className="p-6 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <div className="text-2xl font-bold">
                    {daysUntilDeadline > 0 ? daysUntilDeadline : 0}
                  </div>
                  <div className="text-sm text-gray-600">Days Remaining</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {daysUntilDeadline <= 0 ? 'Deadline passed' : 'Until deadline'}
                  </div>
                </div>
              </PatternWrapper>
            </div>

            {/* Cycle Details and Applications */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="applications">Applications ({stats.total})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cycle Information */}
                  <PatternWrapper pattern="geometric" className="au-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Cycle Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Status</div>
                          <div className="mt-1">{getStatusBadge(cycle.status)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Award Amount</div>
                          <div className="mt-1 text-lg font-semibold">${cycle.amount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Max Recipients</div>
                          <div className="mt-1 text-lg font-semibold">{cycle.maxRecipients}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Applications</div>
                          <div className="mt-1 text-lg font-semibold">{stats.total}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Application Period</div>
                        <div className="mt-1">
                          {new Date(cycle.applicationStartDate).toLocaleDateString()} to{' '}
                          {new Date(cycle.applicationDeadline).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Sponsor</div>
                        <div className="mt-1">{cycle.sponsor}</div>
                      </div>
                      {cycle.description && (
                        <div>
                          <div className="text-sm font-medium text-gray-500">Description</div>
                          <div className="mt-1 text-sm text-gray-600">{cycle.description}</div>
                        </div>
                      )}
                    </CardContent>
                  </PatternWrapper>

                  {/* Application Status Breakdown */}
                  <PatternWrapper pattern="dots" className="au-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        Application Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm">Pending</span>
                          </div>
                          <span className="font-medium">{stats.pending}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">Under Review</span>
                          </div>
                          <span className="font-medium">{stats.underReview}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Approved</span>
                          </div>
                          <span className="font-medium">{stats.approved}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm">Rejected</span>
                          </div>
                          <span className="font-medium">{stats.rejected}</span>
                        </div>
                      </div>
                    </CardContent>
                  </PatternWrapper>
                </div>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <PatternWrapper pattern="geometric" className="au-card">
                  <CardHeader>
                    <CardTitle>All Applications</CardTitle>
                    <CardDescription>
                      Review and manage applications for this scholarship cycle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>GPA</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applications.map((application) => (
                            <TableRow key={application.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{application.studentName}</div>
                                  <div className="text-sm text-gray-500">{application.studentEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell>{application.program}</TableCell>
                              <TableCell>{application.year}</TableCell>
                              <TableCell>
                                <span className={`font-medium ${
                                  application.gpa && application.gpa >= 3.5 ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                  {application.gpa?.toFixed(1) || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(application.submittedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{getApplicationStatusBadge(application.status)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </PatternWrapper>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <PatternWrapper pattern="dots" className="au-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Analytics & Insights
                    </CardTitle>
                    <CardDescription>
                      Performance metrics and insights for this scholarship cycle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Analytics dashboard coming soon</p>
                      <p className="text-sm">Charts and detailed insights will be available here</p>
                    </div>
                  </CardContent>
                </PatternWrapper>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Main>
    </>
  )
}