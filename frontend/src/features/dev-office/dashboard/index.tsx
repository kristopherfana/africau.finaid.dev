import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
import {
  GraduationCap,
  FileText,
  Award,
  Clock,
  TrendingUp,
  Users,
  Bell,
  Plus,
  ArrowRight,
  Target,
  CheckCircle,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Building2,
  Loader2
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useDashboardStats, useDemographicsData, useFeaturedScholarships } from '@/hooks/use-dashboard-stats'

export default function DevOfficeDashboard() {
  const { data: stats, isLoading, error } = useDashboardStats()
  const { data: demographics, isLoading: demographicsLoading } = useDemographicsData()
  const { data: featuredScholarships, isLoading: scholarshipsLoading } = useFeaturedScholarships()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (error) {
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
        <Main className="p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
            <p className="text-gray-600">Unable to fetch dashboard statistics. Please try again later.</p>
          </div>
        </Main>
      </>
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
          {/* Welcome Hero Section */}
          <div className="au-hero-academic text-white py-12 px-8 relative overflow-hidden">
            <div className="container mx-auto relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-4">Development Office Dashboard</h1>
                  <p className="text-lg opacity-90 mb-2">
                    Manage scholarships and track their impact across Africa University
                  </p>
                  <p className="text-sm italic opacity-75 mb-6 border-l-2 border-white/30 pl-4">
                    "Empowering students through strategic scholarship management" - Development Office
                  </p>
                  <div className="flex gap-4">
                    <Link to="/dev-office/scholarships/create">
                      <button className="bg-white text-red-600 hover:bg-gray-100 border-2 border-white px-8 py-3 rounded-md font-semibold transition-all duration-200 flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Scholarship
                      </button>
                    </Link>
                    <Link to="/dev-office/scholarships">
                      <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 rounded-md font-semibold transition-all duration-200 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Manage Scholarships
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 bottom-0 w-[50%] z-0">
              <img 
                src="https://africau.edu/wp-content/uploads/2025/05/ChatGPT.png" 
                alt="Africa University"
                className="w-full h-full object-cover object-center"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,1) 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,1) 100%)'
                }}
              />
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="au-stat-section au-section-gray-textured">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                <span className="ml-2 text-gray-600">Loading statistics...</span>
              </div>
            ) : (
              <div className="au-stat-grid">
                <div className="au-stat-item">
                  <span className="au-stat-number">{stats?.totalScholarships || 0}</span>
                  <span className="au-stat-label">Active Scholarships</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{stats?.approvedApplications || 0}</span>
                  <span className="au-stat-label">Total Beneficiaries</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{stats ? formatCurrency(stats.totalFunding) : '$0'}</span>
                  <span className="au-stat-label">Funds Disbursed (2025)</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{stats?.activeUsers || 0}</span>
                  <span className="au-stat-label">Active Users</span>
                </div>
              </div>
            )}
          </div>

          {/* Main Dashboard Content */}
          <div className="container mx-auto px-8 py-16">
            <div className="au-grid au-grid-3 mb-12">
              {/* Scholarship Overview */}
              <PatternWrapper pattern="dots" className="au-card au-card-featured">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Scholarship Status</h3>
                    <GraduationCap className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="au-status-indicator au-status-active"></div>
                        <span className="text-sm font-medium">Active Scholarships</span>
                      </div>
                      <span className="au-badge au-badge-success">{stats?.totalScholarships || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="au-status-indicator au-status-pending"></div>
                        <span className="text-sm font-medium">Scholarships in Draft</span>
                      </div>
                      <span className="au-badge au-badge-warning">{stats?.draftScholarships || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="au-status-indicator au-status-inactive"></div>
                        <span className="text-sm font-medium">Total Beneficiaries</span>
                      </div>
                      <span className="au-badge au-badge-secondary">{stats?.approvedApplications || 0}</span>
                    </div>
                  </div>
                  <Link to="/dev-office/scholarships" className="block mt-4">
                    <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center">
                      Manage All <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </Link>
                </div>
              </PatternWrapper>

              {/* Recent Activity */}
              <PatternWrapper pattern="geometric" className="au-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Scholarships created this month</p>
                        <p className="text-xs text-gray-500">{stats?.monthlyStats.newScholarships || 0} scholarships - Updated real-time</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Scholarship cycles managed</p>
                        <p className="text-xs text-gray-500">{stats?.totalScholarships || 0} active cycles</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="w-4 h-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Total system users</p>
                        <p className="text-xs text-gray-500">{stats?.totalUsers || 0} registered users</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <DollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Total funding managed</p>
                        <p className="text-xs text-gray-500">{stats ? formatCurrency(stats.totalFunding) : '$0'} in scholarships</p>
                      </div>
                    </div>
                  </div>
                </div>
              </PatternWrapper>

              {/* Year-over-Year Metrics */}
              <PatternWrapper pattern="grid" className="au-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">2025 Performance</h3>
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="space-y-4">
                    {stats ? (
                      <>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Scholarship Success Rate</span>
                            <span className="text-sm font-medium">100%</span>
                          </div>
                          <div className="au-progress">
                            <div
                              className="au-progress-bar"
                              style={{
                                width: '100%'
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total Scholarships</p>
                            <p className="font-bold">{stats.totalScholarships.toLocaleString()} active</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Beneficiaries</p>
                            <p className="font-bold">{stats.approvedApplications.toLocaleString()} students</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <p className="flex items-center">
                            <span className="text-blue-500 mr-1">📊</span> {stats?.monthlyStats.newScholarships || 0} scholarships created this month
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                    <Link to="/dev-office/tracking">
                      <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center">
                        View Yearly Tracking <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </Link>
                  </div>
                </div>
              </PatternWrapper>
            </div>

            {/* Demographics Overview */}
            <div className="mb-12">
              <div className="au-section-header">
                <h2 className="text-2xl font-bold text-gray-800">Current Year Demographics</h2>
              </div>
              <div className="au-grid au-grid-4">
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6 text-center">
                    <PieChart className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <h4 className="font-bold text-lg mb-2">Gender Distribution</h4>
                    {demographicsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Female</span>
                          <span className="font-bold">{demographics?.genderDistribution.female || 0}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Male</span>
                          <span className="font-bold">{demographics?.genderDistribution.male || 0}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="geometric" className="au-card">
                  <div className="p-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-3 text-green-600" />
                    <h4 className="font-bold text-lg mb-2">Academic Levels</h4>
                    {demographicsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Undergrad</span>
                          <span className="font-bold">{demographics?.academicLevels.undergraduate || 0}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Masters</span>
                          <span className="font-bold">{demographics?.academicLevels.masters || 0}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>PhD</span>
                          <span className="font-bold">{demographics?.academicLevels.phd || 0}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="grid" className="au-card">
                  <div className="p-6 text-center">
                    <Target className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                    <h4 className="font-bold text-lg mb-2">Top Programs</h4>
                    {demographicsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {demographics?.topPrograms.slice(0, 3).map((program, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{program.name}</span>
                            <span className="font-bold">{program.percentage}%</span>
                          </div>
                        )) || (
                          <div className="text-sm text-gray-500">No data available</div>
                        )}
                      </div>
                    )}
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
                    <h4 className="font-bold text-lg mb-2">Funding Status</h4>
                    {demographicsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          {demographics ? formatCurrency(demographics.totalFunding) : '$0'}
                        </div>
                        <div className="text-sm text-gray-600">Total Managed</div>
                        <div className="text-xs text-gray-500">
                          Supporting {demographics?.totalBeneficiaries || 0} students
                        </div>
                      </div>
                    )}
                  </div>
                </PatternWrapper>
              </div>
              <div className="text-center mt-8">
                <Link to="/dev-office/demographics">
                  <button className="au-btn-secondary px-8 py-3 text-lg rounded-md font-semibold transition-all duration-200 flex items-center mx-auto">
                    View Detailed Demographics <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Featured Scholarships */}
            <div className="mb-12">
              <div className="au-section-header">
                <h2 className="text-2xl font-bold text-gray-800">Top Performing Scholarships</h2>
              </div>
              {scholarshipsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                  <span className="ml-2 text-gray-600">Loading scholarships...</span>
                </div>
              ) : (
                <div className="au-grid au-grid-2">
                  {featuredScholarships && featuredScholarships.length > 0 ? (
                    featuredScholarships.map((scholarship, index) => (
                      <div key={scholarship.id} className="scholarship-card">
                        <div className="scholarship-card-header">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold mb-2">{scholarship.title}</h3>
                              <p className="text-sm opacity-90">{scholarship.description}</p>
                            </div>
                            {index === 0 ? <GraduationCap className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                          </div>
                        </div>
                        <div className="scholarship-card-body">
                          <div className="flex justify-between items-center mb-4">
                            <span className="scholarship-amount">{scholarship.beneficiaries} Students</span>
                            <span className={`au-badge ${scholarship.status === 'ACTIVE' ? 'au-badge-success' : 'au-badge-secondary'}`}>
                              {scholarship.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-4">
                            <p>Start Year: {scholarship.startYear}</p>
                            <p>Total Applicants: {scholarship.totalApplicants}</p>
                            <p>Total Disbursed: {formatCurrency(scholarship.totalDisbursed)}</p>
                          </div>
                          <Link to="/dev-office/scholarships/$id/" params={{ id: scholarship.id }}>
                            <button className="au-btn-primary w-full py-3 px-4 rounded-md font-semibold transition-all duration-200 flex items-center justify-center">
                              View Details <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No featured scholarships available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mb-12">
              <div className="au-section-header">
                <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
              </div>
              <div className="au-grid au-grid-4">
                <Link to="/dev-office/scholarships/create">
                  <button className="au-card p-6 text-center hover:shadow-lg transition-all duration-200 w-full">
                    <Plus className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <span className="font-semibold">Create Scholarship</span>
                  </button>
                </Link>
                <Link to="/dev-office/reports">
                  <button className="au-card p-6 text-center hover:shadow-lg transition-all duration-200 w-full">
                    <BarChart3 className="w-8 h-8 mx-auto mb-3 text-green-600" />
                    <span className="font-semibold">Generate Report</span>
                  </button>
                </Link>
                <Link to="/dev-office/sponsors">
                  <button className="au-card p-6 text-center hover:shadow-lg transition-all duration-200 w-full">
                    <Building2 className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                    <span className="font-semibold">Manage Sponsors</span>
                  </button>
                </Link>
                <Link to="/dev-office/beneficiaries">
                  <button className="au-card p-6 text-center hover:shadow-lg transition-all duration-200 w-full">
                    <Users className="w-8 h-8 mx-auto mb-3 text-teal-600" />
                    <span className="font-semibold">View Beneficiaries</span>
                  </button>
                </Link>
                <Link to="/dev-office/demographics">
                  <button className="au-card p-6 text-center hover:shadow-lg transition-all duration-200 w-full">
                    <PieChart className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
                    <span className="font-semibold">View Demographics</span>
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </Main>
    </>
  )
}