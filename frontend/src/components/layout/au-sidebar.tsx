import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Home,
  Search,
  Upload,
  Award,
  Users2,
  Building2,
  ChartBar,
  FileSpreadsheet,
  Bell,
  FileText,
  ClipboardCheck,
  GraduationCap,
  Settings,
  HelpCircle,
  User
} from 'lucide-react'

interface NavItem {
  title: string
  url: string
  icon: React.ElementType
  badge?: string
  active?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navigationData: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', url: '/', icon: Home, active: true },
      { title: 'Browse Scholarships', url: '/scholarships', icon: Search },
      { title: 'My Applications', url: '/applications', icon: FileText },
      { title: 'Upload Documents', url: '/documents', icon: Upload },
      { title: 'Awarded Scholarships', url: '/awards', icon: Award },
      { title: 'Notifications', url: '/notifications', icon: Bell, badge: '2' },
    ]
  },
  {
    title: 'Administration',
    items: [
      { title: 'Application Review', url: '/admin/applications', icon: ClipboardCheck },
      { title: 'Manage Scholarships', url: '/admin/scholarships', icon: GraduationCap },
      { title: 'Sponsor Management', url: '/admin/sponsors', icon: Building2 },
      { title: 'Student Management', url: '/admin/students', icon: Users2 },
      { title: 'Reports & Analytics', url: '/admin/reports', icon: ChartBar },
      { title: 'Export Data', url: '/admin/export', icon: FileSpreadsheet },
    ]
  },
  {
    title: 'Account',
    items: [
      { title: 'Profile Settings', url: '/settings', icon: User },
      { title: 'Account Settings', url: '/settings/account', icon: Settings },
      { title: 'Help & Support', url: '/help-center', icon: HelpCircle },
    ]
  }
]

export function AUSidebar() {
  return (
    <div className="au-sidebar h-full w-64 flex flex-col">
      {/* Header with AU Branding */}
      <div className="au-sidebar-header">
        <div className="flex items-center gap-3">
          <img 
            src="/images/au-logo.jpg" 
            alt="Africa University" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="font-bold text-lg">Africa University</h1>
            <p className="text-xs opacity-90">Scholarship System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {navigationData.map((group) => (
          <div key={group.title}>
            <div className="au-nav-section-header">
              {group.title}
            </div>
            <nav>
              {group.items.map((item) => (
                <Link
                  key={item.url}
                  to={item.url}
                  className={`au-nav-item ${item.active ? 'active' : ''}`}
                >
                  <item.icon className="au-nav-item-icon" />
                  <span className="au-nav-item-text">{item.title}</span>
                  {item.badge && (
                    <span className="au-nav-item-badge">{item.badge}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer with User Profile */}
      <div className="au-sidebar-footer">
        <div className="au-user-profile">
          <div className="au-user-avatar">
            JD
          </div>
          <div className="au-user-info">
            <h4>John Doe</h4>
            <p>student@africau.edu</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrapper component to integrate with existing sidebar system
export function AUSidebarWrapper() {
  return (
    <div className="fixed left-0 top-0 h-full z-30 bg-white border-r border-gray-200">
      <AUSidebar />
    </div>
  )
}