import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  CheckCircle
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

export default function Dashboard() {
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
                  <h1 className="text-4xl font-bold mb-4">Welcome back, John!</h1>
                  <p className="text-lg opacity-90 mb-2">
                    Continue your scholarship journey at Africa University
                  </p>
                  <p className="text-sm italic opacity-75 mb-6 border-l-2 border-white/30 pl-4">
                    "Totally Committed to Excellence in Higher Education" - Africa University
                  </p>
                  <div className="flex gap-4">
                    <Link to="/scholarships">
                      <button className="bg-white text-red-600 hover:bg-gray-100 border-2 border-white px-8 py-3 rounded-md font-semibold transition-all duration-200 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Browse Scholarships
                      </button>
                    </Link>
                    <Link to="/applications">
                      <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 rounded-md font-semibold transition-all duration-200 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        My Applications
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
            <div className="au-stat-grid">
              <div className="au-stat-item">
                <span className="au-stat-number">3</span>
                <span className="au-stat-label">Active Applications</span>
              </div>
              <div className="au-stat-item">
                <span className="au-stat-number">1</span>
                <span className="au-stat-label">Awarded Scholarship</span>
              </div>
              <div className="au-stat-item">
                <span className="au-stat-number">12</span>
                <span className="au-stat-label">Available Opportunities</span>
              </div>
              <div className="au-stat-item">
                <span className="au-stat-number">85%</span>
                <span className="au-stat-label">Profile Completion</span>
              </div>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="container mx-auto px-8 py-16">
            <div className="au-grid au-grid-3 mb-12">
              {/* Application Status */}
              <PatternWrapper pattern="dots" className="au-card au-card-featured">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Application Status</h3>
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="au-status-indicator au-status-pending"></div>
                        <span className="text-sm font-medium">Engineering Excellence</span>
                      </div>
                      <span className="au-badge au-badge-warning">Under Review</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="au-status-indicator au-status-active"></div>
                        <span className="text-sm font-medium">Academic Merit</span>
                      </div>
                      <span className="au-badge au-badge-success">Approved</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="au-status-indicator au-status-pending"></div>
                        <span className="text-sm font-medium">Research Grant</span>
                      </div>
                      <span className="au-badge au-badge-warning">Documents Needed</span>
                    </div>
                  </div>
                  <Link to="/applications" className="block mt-4">
                    <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center">
                      View All Applications <ArrowRight className="w-4 h-4 ml-2" />
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
                        <p className="text-sm font-medium">Application submitted</p>
                        <p className="text-xs text-gray-500">Engineering Excellence - 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Bell className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">New scholarship available</p>
                        <p className="text-xs text-gray-500">Computer Science Merit - 3 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Award className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Scholarship awarded</p>
                        <p className="text-xs text-gray-500">Academic Merit Award - 1 week ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </PatternWrapper>

              {/* Profile Completion */}
              <PatternWrapper pattern="grid" className="au-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Profile Status</h3>
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Profile Completion</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="au-progress">
                        <div className="au-progress-bar" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Missing items:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Upload transcript</li>
                        <li>• Add recommendation letter</li>
                        <li>• Complete personal statement</li>
                      </ul>
                    </div>
                    <Link to="/settings">
                      <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center">
                        Complete Profile <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </Link>
                  </div>
                </div>
              </PatternWrapper>
            </div>

            {/* Available Scholarships Preview */}
            <div className="mb-12">
              <div className="au-section-header">
                <h2 className="text-2xl font-bold text-gray-800">Featured Opportunities</h2>
              </div>
              <div className="au-grid au-grid-2">
                <div className="scholarship-card">
                  <div className="scholarship-card-header">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Engineering Excellence Award</h3>
                        <p className="text-sm opacity-90">Full tuition coverage for engineering students</p>
                      </div>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="scholarship-card-body">
                    <div className="flex justify-between items-center mb-4">
                      <span className="scholarship-amount">$25,000</span>
                      <span className="au-badge au-badge-success">Open</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Deadline: March 15, 2025</p>
                      <p>Field: Engineering & Technology</p>
                    </div>
                    <Link to="/scholarships/$id/apply" params={{ id: "engineering-excellence" }}>
                      <button className="au-btn-primary w-full py-3 px-4 rounded-md font-semibold transition-all duration-200 flex items-center justify-center">
                        Apply Now <Plus className="w-4 h-4 ml-2" />
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="scholarship-card">
                  <div className="scholarship-card-header">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Research Innovation Grant</h3>
                        <p className="text-sm opacity-90">Supporting groundbreaking research projects</p>
                      </div>
                      <Target className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="scholarship-card-body">
                    <div className="flex justify-between items-center mb-4">
                      <span className="scholarship-amount">$15,000</span>
                      <span className="au-badge au-badge-success">Open</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Deadline: April 1, 2025</p>
                      <p>Field: All Disciplines</p>
                    </div>
                    <Link to="/scholarships/$id/apply" params={{ id: "research-innovation" }}>
                      <button className="au-btn-primary w-full py-3 px-4 rounded-md font-semibold transition-all duration-200 flex items-center justify-center">
                        Apply Now <Plus className="w-4 h-4 ml-2" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
                <Link to="/scholarships">
                  <button className="au-btn-secondary px-8 py-3 text-lg rounded-md font-semibold transition-all duration-200 flex items-center">
                    View All Scholarships <ArrowRight className="w-5 h-5 ml-2" />
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

const topNav = [
  {
    title: 'Scholarships',
    href: '/scholarships',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Applications',
    href: '/applications',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Documents',
    href: '/documents',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Support',
    href: '/help-center',
    isActive: false,
    disabled: false,
  },
]
