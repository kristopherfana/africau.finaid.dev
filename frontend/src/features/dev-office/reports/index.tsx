import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  useReportsMetadata,
  useFinancialReport,
  useApplicationsReport,
  useScholarshipsReport,
  ReportMetadata
} from '@/hooks/use-reports'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
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
  Download,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Settings,
  Plus
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Remove mock data - we'll use real data from hooks

export default function Reports() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)

  // Get real data from APIs
  const { data: reportsMetadata, isLoading: reportsLoading, error: reportsError } = useReportsMetadata()
  const { data: dashboardStats, isLoading: dashboardLoading } = useDashboardStats()
  const { data: financialData, isLoading: financialLoading } = useFinancialReport()
  const { data: applicationsData, isLoading: applicationsLoading } = useApplicationsReport()

  const isLoading = reportsLoading || dashboardLoading || financialLoading || applicationsLoading
  const reports = reportsMetadata || []

  const filteredReports = reports.filter(report => {
    const matchesType = selectedType === 'all' || report.type === selectedType
    const matchesFrequency = selectedFrequency === 'all' || report.frequency === selectedFrequency
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesType && matchesFrequency && matchesSearch
  })

  // Calculate real statistics
  const totalReports = reports.length
  const totalDownloads = reports.reduce((sum, report) => sum + report.downloadCount, 0)
  const scheduledReports = reports.filter(report => report.status === 'SCHEDULED').length
  const totalSize = reports.reduce((sum, report) => {
    if (report.fileSize) {
      const size = parseFloat(report.fileSize.replace(/[^\d.]/g, ''))
      return sum + size
    }
    return sum
  }, 0)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FINANCIAL': return <DollarSign className="w-4 h-4" />
      case 'DEMOGRAPHIC': return <Users className="w-4 h-4" />
      case 'PERFORMANCE': return <TrendingUp className="w-4 h-4" />
      case 'CUSTOM': return <Settings className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
        return 'au-badge au-badge-success'
      case 'GENERATING':
        return 'au-badge au-badge-warning'
      case 'SCHEDULED':
        return 'au-badge au-badge-secondary'
      default:
        return 'au-badge'
    }
  }

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
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
                  <p className="text-gray-600">Generate and manage comprehensive scholarship reports</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center"
                    onClick={() => setShowCustomBuilder(!showCustomBuilder)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Custom Report
                  </Button>
                  <Button className="au-btn-primary flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="au-stat-section au-section-gray-textured">
            <div className="container mx-auto">
              {reportsError ? (
                <div className="au-stat-grid">
                  <div className="col-span-4 p-8 text-center">
                    <p className="text-red-600 mb-2">Error loading reports data</p>
                    <p className="text-gray-500 text-sm">Please try refreshing the page</p>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="au-stat-grid">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="au-stat-item">
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : totalReports === 0 ? (
                <div className="au-stat-grid">
                  <div className="col-span-4 p-8 text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No Reports Data Available</p>
                    <p className="text-gray-500 text-sm">
                      Reports will be available once there's scholarship data to analyze
                    </p>
                  </div>
                </div>
              ) : (
                <div className="au-stat-grid">
                  <div className="au-stat-item">
                    <span className="au-stat-number">{totalReports}</span>
                    <span className="au-stat-label">Available Reports</span>
                  </div>
                  <div className="au-stat-item">
                    <span className="au-stat-number">{totalDownloads}</span>
                    <span className="au-stat-label">Total Downloads</span>
                  </div>
                  <div className="au-stat-item">
                    <span className="au-stat-number">{scheduledReports}</span>
                    <span className="au-stat-label">Scheduled Reports</span>
                  </div>
                  <div className="au-stat-item">
                    <span className="au-stat-number">{totalSize.toFixed(1)} MB</span>
                    <span className="au-stat-label">Total Size</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="container mx-auto px-8 py-8">
            {/* Custom Report Builder */}
            {showCustomBuilder && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Custom Report Builder
                  </CardTitle>
                  <CardDescription>
                    Create a custom report with specific metrics and timeframes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reportName">Report Name</Label>
                        <Input id="reportName" placeholder="Enter report name..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="date" />
                          <Input type="date" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Report Format</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Include Metrics</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="financial" defaultChecked />
                            <Label htmlFor="financial">Financial Data</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="demographics" defaultChecked />
                            <Label htmlFor="demographics">Demographics</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="performance" defaultChecked />
                            <Label htmlFor="performance">Performance Metrics</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="scholarships" />
                            <Label htmlFor="scholarships">Scholarship Details</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setShowCustomBuilder(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="au-btn-primary"
                      onClick={() => {
                        // In a real app, this would send the custom report parameters to the backend
                        alert('Custom report generation functionality would be implemented here')
                        setShowCustomBuilder(false)
                      }}
                    >
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <PatternWrapper pattern="dots" className="au-card mb-6">
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="FINANCIAL">Financial</SelectItem>
                      <SelectItem value="DEMOGRAPHIC">Demographic</SelectItem>
                      <SelectItem value="PERFORMANCE">Performance</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                    <SelectTrigger className="w-[180px]">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frequencies</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="ANNUAL">Annual</SelectItem>
                      <SelectItem value="ON_DEMAND">On Demand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PatternWrapper>

            {/* Quick Report Actions - only show if there's data */}
            {(dashboardStats && (dashboardStats.totalApplications > 0 || dashboardStats.totalScholarships > 0 || dashboardStats.totalUsers > 0)) || financialData ? (
              <div className="au-grid au-grid-4 mb-8">
                {financialData && (
                  <PatternWrapper pattern="dots" className="au-card">
                    <button
                      className="p-6 text-center hover:shadow-lg transition-all duration-200 w-full"
                      onClick={() => {
                        // Trigger financial report download
                        window.open('/api/reports/financial-report?format=pdf', '_blank')
                      }}
                    >
                      <BarChart3 className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                      <span className="font-semibold">Financial Summary</span>
                      <p className="text-xs text-gray-600 mt-1">
                        ${(financialData.totalFunding / 1000000).toFixed(1)}M total
                      </p>
                    </button>
                  </PatternWrapper>
                )}
                {dashboardStats && dashboardStats.totalUsers > 0 && (
                  <PatternWrapper pattern="geometric" className="au-card">
                    <button
                      className="p-6 text-center hover:shadow-lg transition-all duration-200 w-full"
                      onClick={() => {
                        // Trigger demographics report download
                        window.open('/api/reports/demographics?format=pdf', '_blank')
                      }}
                    >
                      <PieChart className="w-8 h-8 mx-auto mb-3 text-green-600" />
                      <span className="font-semibold">Demographics</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {dashboardStats.totalUsers} users
                      </p>
                    </button>
                  </PatternWrapper>
                )}
                {dashboardStats && dashboardStats.totalApplications > 0 && (
                  <PatternWrapper pattern="grid" className="au-card">
                    <button
                      className="p-6 text-center hover:shadow-lg transition-all duration-200 w-full"
                      onClick={() => {
                        // Trigger applications report download
                        window.open('/api/reports/applications-report?format=pdf', '_blank')
                      }}
                    >
                      <TrendingUp className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                      <span className="font-semibold">Applications</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {dashboardStats.totalApplications} total
                      </p>
                    </button>
                  </PatternWrapper>
                )}
                {dashboardStats && dashboardStats.totalScholarships > 0 && (
                  <PatternWrapper pattern="dots" className="au-card">
                    <button
                      className="p-6 text-center hover:shadow-lg transition-all duration-200 w-full"
                      onClick={() => {
                        // Trigger scholarships report download
                        window.open('/api/reports/scholarships-report?format=pdf', '_blank')
                      }}
                    >
                      <Users className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
                      <span className="font-semibold">Scholarships</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {dashboardStats.totalScholarships} active
                      </p>
                    </button>
                  </PatternWrapper>
                )}
              </div>
            ) : null}

            {/* Reports Table */}
            <PatternWrapper pattern="geometric" className="au-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Available Reports</h3>
                  <div className="text-sm text-gray-600">
                    {filteredReports.length} of {totalReports} reports
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex space-x-4 p-4">
                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="w-20 h-4 bg-gray-200 rounded"></div>
                            <div className="w-24 h-4 bg-gray-200 rounded"></div>
                            <div className="w-16 h-8 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="p-12 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reports Available</h3>
                      <p className="text-gray-500 mb-4">
                        {totalReports === 0
                          ? "There are currently no reports available. Reports will appear here once there's data to analyze."
                          : "No reports match your current filters. Try adjusting your search criteria."
                        }
                      </p>
                      {totalReports === 0 && (
                        <Button
                          variant="outline"
                          className="flex items-center mx-auto"
                          onClick={() => setShowCustomBuilder(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Custom Report
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Last Generated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {getTypeIcon(report.type)}
                                {report.name}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {report.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="au-badge au-badge-secondary">
                              {report.type}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="text-sm">{report.frequency}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="text-sm">{report.lastGenerated}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={getStatusBadge(report.status)}>
                              {report.status}
                            </span>
                          </TableCell>
                          <TableCell>{report.fileSize}</TableCell>
                          <TableCell>{report.downloadCount}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {report.status === 'READY' && (
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  )}
                </div>
              </div>
            </PatternWrapper>
          </div>
        </div>
      </Main>
    </>
  )
}