import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChecklist,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
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
  Bell
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Student Name',
    email: 'student@africau.edu',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Africa University',
      logo: GraduationCap,
      plan: 'Scholarship System',
    },
  ],
  navGroups: [
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
      items: [
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
      ],
    },
  ],
}
