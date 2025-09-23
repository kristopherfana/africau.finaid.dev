import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
import { useDashboardStats, useDemographicsData } from '@/hooks/use-dashboard-stats'
import { useActiveScholarships } from '@/hooks/use-scholarships'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Award,
  BarChart3,
  Download,
  Filter,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface YearlyData {
  year: number
  totalScholarships: number
  totalBeneficiaries: number
  newBeneficiaries: number
  totalDisbursed: number
  averageAmount: number
  completionRate: number
  dropoutRate: number
  maleCount: number
  femaleCount: number
  undergradCount: number
  mastersCount: number
  phdCount: number
}

const mockYearlyData: YearlyData[] = [
  {
    year: 2025,
    totalScholarships: 42,
    totalBeneficiaries: 1847,
    newBeneficiaries: 450,
    totalDisbursed: 2500000,
    averageAmount: 15000,
    completionRate: 78,
    dropoutRate: 3,
    maleCount: 887,
    femaleCount: 960,
    undergradCount: 1256,
    mastersCount: 443,
    phdCount: 148
  },
  {
    year: 2024,
    totalScholarships: 38,
    totalBeneficiaries: 1502,
    newBeneficiaries: 380,
    totalDisbursed: 2100000,
    averageAmount: 14500,
    completionRate: 82,
    dropoutRate: 2.5,
    maleCount: 751,
    femaleCount: 751,
    undergradCount: 1051,
    mastersCount: 361,
    phdCount: 90
  },
  {
    year: 2023,
    totalScholarships: 35,
    totalBeneficiaries: 1320,
    newBeneficiaries: 350,
    totalDisbursed: 1850000,
    averageAmount: 14000,
    completionRate: 85,
    dropoutRate: 2,
    maleCount: 660,
    femaleCount: 660,
    undergradCount: 924,
    mastersCount: 316,
    phdCount: 80
  },
  {
    year: 2022,
    totalScholarships: 30,
    totalBeneficiaries: 1050,
    newBeneficiaries: 300,
    totalDisbursed: 1500000,
    averageAmount: 13500,
    completionRate: 88,
    dropoutRate: 1.8,
    maleCount: 525,
    femaleCount: 525,
    undergradCount: 735,
    mastersCount: 252,
    phdCount: 63
  },
]

export default function YearlyTracking() {
  const [selectedYear, setSelectedYear] = useState<string>('2025')
  const [comparisonYear, setComparisonYear] = useState<string>('2024')
  const [scholarshipFilter, setScholarshipFilter] = useState<string>('all')

  const { data: dashboardStats, isLoading: dashboardLoading, error: dashboardError } = useDashboardStats()
  const { data: demographicsData, isLoading: demographicsLoading, error: demographicsError } = useDemographicsData()
  const { data: scholarshipsData } = useActiveScholarships()

  // Create current year data from API
  const currentYearData = {
    year: parseInt(selectedYear),
    totalScholarships: dashboardStats?.totalScholarships || 0,
    totalBeneficiaries: demographicsData?.totalBeneficiaries || 0,
    newBeneficiaries: dashboardStats?.monthlyStats?.newApplications || 0,
    totalDisbursed: dashboardStats?.totalFunding || 0,
    averageAmount: dashboardStats?.totalFunding && dashboardStats?.approvedApplications
      ? Math.round(dashboardStats.totalFunding / dashboardStats.approvedApplications)
      : 0,
    completionRate: 85, // This would need a specific API endpoint
    dropoutRate: 3,
    maleCount: demographicsData ? Math.round((demographicsData.totalBeneficiaries * demographicsData.genderDistribution.male) / 100) : 0,
    femaleCount: demographicsData ? Math.round((demographicsData.totalBeneficiaries * demographicsData.genderDistribution.female) / 100) : 0,
    undergradCount: demographicsData ? Math.round((demographicsData.totalBeneficiaries * demographicsData.academicLevels.undergraduate) / 100) : 0,
    mastersCount: demographicsData ? Math.round((demographicsData.totalBeneficiaries * demographicsData.academicLevels.masters) / 100) : 0,
    phdCount: demographicsData ? Math.round((demographicsData.totalBeneficiaries * demographicsData.academicLevels.phd) / 100) : 0,
  }

  // For comparison data, we'll use the mock data for now (ideally this would be historical API data)
  const comparisonData = mockYearlyData.find(d => d.year.toString() === comparisonYear) || mockYearlyData[1]

  const isLoading = dashboardLoading || demographicsLoading
  const hasError = dashboardError || demographicsError

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return change
  }

  const renderChangeIndicator = (current: number, previous: number, inverse = false) => {
    const change = calculateChange(current, previous)
    const isPositive = inverse ? change < 0 : change > 0
    return (
      <span className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {Math.abs(change).toFixed(1)}%
      </span>
    )
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
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Yearly Tracking</h1>
                  <p className="text-gray-600">
                    Monitor scholarship performance and trends over time
                    {scholarshipFilter !== 'all' && scholarshipsData?.data && (
                      <span className="block text-sm mt-1 text-blue-600 font-medium">
                        Filtered by: {scholarshipsData.data.find(s => s.id === scholarshipFilter)?.name}
                      </span>
                    )}
                  </p>
                </div>
                <Button className="au-btn-secondary flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>

          {/* Year Selection */}
          <div className="container mx-auto px-8 py-6">
            <PatternWrapper pattern="dots" className="au-card">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">Viewing Year:</span>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockYearlyData.map(data => (
                          <SelectItem key={data.year} value={data.year.toString()}>
                            {data.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">Compare with:</span>
                    <Select value={comparisonYear} onValueChange={setComparisonYear}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockYearlyData
                          .filter(data => data.year.toString() !== selectedYear)
                          .map(data => (
                            <SelectItem key={data.year} value={data.year.toString()}>
                              {data.year}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">Scholarship:</span>
                    <Select value={scholarshipFilter} onValueChange={setScholarshipFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Scholarships" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Scholarships</SelectItem>
                        {scholarshipsData?.data?.map((scholarship) => (
                          <SelectItem key={scholarship.id} value={scholarship.id}>
                            {scholarship.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PatternWrapper>
          </div>

          {/* Key Metrics */}
          <div className="container mx-auto px-8 pb-6">
            {hasError ? (
              <div className="au-grid au-grid-1">
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-8 text-center">
                    <p className="text-red-600 mb-2">Error loading tracking data</p>
                    <p className="text-gray-500 text-sm">Please try refreshing the page</p>
                  </div>
                </PatternWrapper>
              </div>
            ) : isLoading ? (
              <div className="au-grid au-grid-4">
                {[1, 2, 3, 4].map((i) => (
                  <PatternWrapper key={i} pattern="dots" className="au-card">
                    <div className="p-6">
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </PatternWrapper>
                ))}
              </div>
            ) : (
              <div className="au-grid au-grid-4">
              <PatternWrapper pattern="dots" className="au-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-6 h-6 text-blue-600" />
                    {renderChangeIndicator(currentYearData.totalScholarships, comparisonData.totalScholarships)}
                  </div>
                  <div className="text-2xl font-bold">{currentYearData.totalScholarships}</div>
                  <div className="text-sm text-gray-600">Active Scholarships</div>
                  <div className="text-xs text-gray-500 mt-1">
                    vs {comparisonData.totalScholarships} in {comparisonYear}
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="geometric" className="au-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-green-600" />
                    {renderChangeIndicator(currentYearData.totalBeneficiaries, comparisonData.totalBeneficiaries)}
                  </div>
                  <div className="text-2xl font-bold">{currentYearData.totalBeneficiaries.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Beneficiaries</div>
                  <div className="text-xs text-gray-500 mt-1">
                    +{currentYearData.newBeneficiaries} new this year
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="grid" className="au-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                    {renderChangeIndicator(currentYearData.totalDisbursed, comparisonData.totalDisbursed)}
                  </div>
                  <div className="text-2xl font-bold">${(currentYearData.totalDisbursed / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-gray-600">Total Disbursed</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Avg: ${currentYearData.averageAmount.toLocaleString()}
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="dots" className="au-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-6 h-6 text-purple-600" />
                    {renderChangeIndicator(currentYearData.completionRate, comparisonData.completionRate)}
                  </div>
                  <div className="text-2xl font-bold">{currentYearData.completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Dropout: {currentYearData.dropoutRate}%
                  </div>
                </div>
              </PatternWrapper>
              </div>
            )}
          </div>

          {/* Detailed Comparison Table */}
          <div className="container mx-auto px-8 pb-8">
            <PatternWrapper pattern="geometric" className="au-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Year-over-Year Comparison</h3>
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Scholarships</TableHead>
                        <TableHead>Total Beneficiaries</TableHead>
                        <TableHead>New Beneficiaries</TableHead>
                        <TableHead>Amount Disbursed</TableHead>
                        <TableHead>Avg. Amount</TableHead>
                        <TableHead>Completion Rate</TableHead>
                        <TableHead>Gender Ratio (F:M)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockYearlyData.map((data) => (
                        <TableRow key={data.year} className={data.year.toString() === selectedYear ? 'bg-blue-50' : ''}>
                          <TableCell className="font-medium">
                            {data.year}
                            {data.year.toString() === selectedYear && (
                              <span className="ml-2 text-xs au-badge au-badge-primary">Current</span>
                            )}
                          </TableCell>
                          <TableCell>{data.totalScholarships}</TableCell>
                          <TableCell>{data.totalBeneficiaries.toLocaleString()}</TableCell>
                          <TableCell>+{data.newBeneficiaries}</TableCell>
                          <TableCell>${(data.totalDisbursed / 1000000).toFixed(2)}M</TableCell>
                          <TableCell>${data.averageAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{data.completionRate}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${data.completionRate}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {((data.femaleCount / (data.femaleCount + data.maleCount)) * 100).toFixed(0)}:
                            {((data.maleCount / (data.femaleCount + data.maleCount)) * 100).toFixed(0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </PatternWrapper>
          </div>

          {/* Demographics Breakdown */}
          <div className="container mx-auto px-8 pb-8">
            <div className="au-section-header mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedYear} Demographics Breakdown
                {scholarshipFilter !== 'all' && scholarshipsData?.data && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    - {scholarshipsData.data.find(s => s.id === scholarshipFilter)?.name}
                  </span>
                )}
              </h2>
            </div>
            <div className="au-grid au-grid-3">
              {/* Gender Distribution */}
              <PatternWrapper pattern="dots" className="au-card">
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-4">Gender Distribution</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Female</span>
                        <span className="text-sm font-bold">
                          {currentYearData.femaleCount} ({((currentYearData.femaleCount / currentYearData.totalBeneficiaries) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-pink-500 h-3 rounded-full"
                          style={{ width: `${(currentYearData.femaleCount / currentYearData.totalBeneficiaries) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Male</span>
                        <span className="text-sm font-bold">
                          {currentYearData.maleCount} ({((currentYearData.maleCount / currentYearData.totalBeneficiaries) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${(currentYearData.maleCount / currentYearData.totalBeneficiaries) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </PatternWrapper>

              {/* Academic Level Distribution */}
              <PatternWrapper pattern="geometric" className="au-card">
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-4">Academic Levels</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Undergraduate</span>
                        <span className="text-sm font-bold">
                          {currentYearData.undergradCount} ({((currentYearData.undergradCount / currentYearData.totalBeneficiaries) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${(currentYearData.undergradCount / currentYearData.totalBeneficiaries) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Masters</span>
                        <span className="text-sm font-bold">
                          {currentYearData.mastersCount} ({((currentYearData.mastersCount / currentYearData.totalBeneficiaries) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-yellow-500 h-3 rounded-full"
                          style={{ width: `${(currentYearData.mastersCount / currentYearData.totalBeneficiaries) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">PhD</span>
                        <span className="text-sm font-bold">
                          {currentYearData.phdCount} ({((currentYearData.phdCount / currentYearData.totalBeneficiaries) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-purple-500 h-3 rounded-full"
                          style={{ width: `${(currentYearData.phdCount / currentYearData.totalBeneficiaries) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </PatternWrapper>

              {/* Trends */}
              <PatternWrapper pattern="grid" className="au-card">
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-4">Key Trends</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Growth Rate</p>
                        <p className="text-xs text-gray-600">
                          {calculateChange(currentYearData.totalBeneficiaries, comparisonData.totalBeneficiaries).toFixed(1)}% YoY increase
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Average Funding</p>
                        <p className="text-xs text-gray-600">
                          ${currentYearData.averageAmount.toLocaleString()} per student
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">New Recipients</p>
                        <p className="text-xs text-gray-600">
                          {currentYearData.newBeneficiaries} new students this year
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </PatternWrapper>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}