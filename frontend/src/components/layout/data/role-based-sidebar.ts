import {
  IconHelp,
  IconSettings,
  IconUserCog,
} from '@tabler/icons-react'
import { 
  GraduationCap, 
  FileText, 
  ClipboardCheck,
  Home,
  Search,
  Upload,
  Award,
  Users2,
  Building2,
  ChartBar,
  FileSpreadsheet,
  Bell,
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  Calendar,
  PieChart,
  BookOpen,
  Settings2
} from 'lucide-react'
import { type SidebarData } from '../types'
import { UserRole } from '@/stores/authStore'

const commonAccountItems = [
  {
    title: 'Profile Settings',
    url: '/settings',
    icon: IconUserCog,
  },
  {
    title: 'Account Settings',
    url: '/settings/account',
    icon: IconSettings,
  },
  {
    title: 'Help & Support',
    url: '/help-center',
    icon: IconHelp,
  },
]

export const getNavDataForRole = (role: UserRole, user: any): SidebarData => {
  const baseData = {
    user: {
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User',
      email: user?.email || 'user@africau.edu',
      avatar: user?.profilePicture || '/avatars/default.jpg',
    },
    teams: [
      {
        name: 'Africa University',
        logo: GraduationCap,
        plan: 'Scholarship System',
      },
    ],
    navGroups: [] as any[],
  }

  switch (role) {
    case 'STUDENT':
      baseData.navGroups = [
        {
          title: 'Main',
          items: [
            {
              title: 'Dashboard',
              url: '/',
              icon: Home,
            },
            {
              title: 'Browse Scholarships',
              url: '/scholarships',
              icon: Search,
            },
            {
              title: 'My Applications',
              url: '/applications',
              icon: FileText,
            },
            {
              title: 'Upload Documents',
              url: '/documents',
              icon: Upload,
            },
            {
              title: 'Awarded Scholarships',
              url: '/awards',
              icon: Award,
            },
            {
              title: 'Notifications',
              url: '/notifications',
              badge: '2',
              icon: Bell,
            },
          ],
        },
        {
          title: 'Account',
          items: commonAccountItems,
        },
      ]
      break

    case 'ADMIN':
      baseData.navGroups = [
        {
          title: 'Main',
          items: [
            {
              title: 'Dashboard',
              url: '/',
              icon: Home,
            },
          ],
        },
        {
          title: 'Administration',
          items: [
            {
              title: 'Application Review',
              url: '/admin/applications',
              icon: ClipboardCheck,
            },
            {
              title: 'Manage Scholarships',
              url: '/admin/scholarships',
              icon: GraduationCap,
            },
            {
              title: 'Sponsor Management',
              url: '/admin/sponsors',
              icon: Building2,
            },
            {
              title: 'Student Management',
              url: '/admin/students',
              icon: Users2,
            },
            {
              title: 'Reports & Analytics',
              url: '/admin/reports',
              icon: ChartBar,
            },
            {
              title: 'Export Data',
              url: '/admin/export',
              icon: FileSpreadsheet,
            },
          ],
        },
        {
          title: 'Account',
          items: commonAccountItems,
        },
      ]
      break

    case 'DEVELOPMENT_OFFICE':
      baseData.navGroups = [
        {
          title: 'Main',
          items: [
            {
              title: 'Dashboard',
              url: '/dev-office',
              icon: Home,
            },
            {
              title: 'All Scholarships',
              url: '/dev-office/scholarships',
              icon: GraduationCap,
              badge: 'Manage',
            },
          ],
        },
        {
          title: 'Scholarship Management',
          items: [
            {
              title: 'Create Scholarship',
              url: '/dev-office/scholarships/create',
              icon: Target,
            },
            {
              title: 'Yearly Tracking',
              url: '/dev-office/tracking',
              icon: Calendar,
            },
            {
              title: 'Demographics Analysis',
              url: '/dev-office/demographics',
              icon: PieChart,
            },
            {
              title: 'Impact Reports',
              url: '/dev-office/reports',
              icon: BarChart3,
            },
          ],
        },
        {
          title: 'Sponsor Relations',
          items: [
            {
              title: 'Manage Sponsors',
              url: '/dev-office/sponsors',
              icon: Building2,
            },
            {
              title: 'Funding Overview',
              url: '/dev-office/funding',
              icon: DollarSign,
            },
          ],
        },
        {
          title: 'Student Support',
          items: [
            {
              title: 'Beneficiaries',
              url: '/dev-office/beneficiaries',
              icon: Users2,
            },
          ],
        },
        {
          title: 'Account',
          items: commonAccountItems,
        },
      ]
      break

    case 'SPONSOR':
      baseData.navGroups = [
        {
          title: 'Main',
          items: [
            {
              title: 'Dashboard',
              url: '/',
              icon: Home,
            },
            {
              title: 'Browse Scholarships',
              url: '/scholarships',
              icon: Search,
            },
          ],
        },
        {
          title: 'Sponsor Portal',
          items: [
            {
              title: 'My Sponsored Students',
              url: '/sponsor/students',
              icon: Users2,
            },
            {
              title: 'Funding Overview',
              url: '/sponsor/funding',
              icon: DollarSign,
            },
            {
              title: 'Impact Reports',
              url: '/sponsor/reports',
              icon: TrendingUp,
            },
            {
              title: 'Create Scholarship',
              url: '/sponsor/scholarships/create',
              icon: Target,
            },
            {
              title: 'Manage Scholarships',
              url: '/sponsor/scholarships',
              icon: GraduationCap,
            },
          ],
        },
        {
          title: 'Account',
          items: commonAccountItems,
        },
      ]
      break

    default:
      baseData.navGroups = [
        {
          title: 'Main',
          items: [
            {
              title: 'Dashboard',
              url: '/',
              icon: Home,
            },
          ],
        },
        {
          title: 'Account',
          items: commonAccountItems,
        },
      ]
  }

  return baseData
}