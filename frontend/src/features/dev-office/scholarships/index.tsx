import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Calendar,
  DollarSign,
  Users,
  MoreVertical,
  TrendingUp,
  Archive,
  Copy
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Scholarship {
  id: string
  name: string
  sponsor: string
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'ARCHIVED'
  startYear: number
  endYear?: number
  totalBeneficiaries: number
  currentYearBeneficiaries: number
  amount: number
  availableSlots: number
  totalSlots: number
  disbursedAmount: number
  isRecurring: boolean
}

// Mock data
const mockScholarships: Scholarship[] = [
  {
    id: '1',
    name: 'Africa University Excellence Award',
    sponsor: 'AU Foundation',
    status: 'ACTIVE',
    startYear: 2020,
    endYear: undefined,
    totalBeneficiaries: 450,
    currentYearBeneficiaries: 120,
    amount: 26000, // Current cycle amount
    availableSlots: 5,  // Current cycle available
    totalSlots: 55,     // Current cycle total
    disbursedAmount: 3200000,
    isRecurring: true
  },
  {
    id: '2',
    name: 'STEM Innovation Scholarship',
    sponsor: 'Tech Foundation',
    status: 'ACTIVE',
    startYear: 2022,
    endYear: 2027,
    totalBeneficiaries: 280,
    currentYearBeneficiaries: 95,
    amount: 20000,
    availableSlots: 15,
    totalSlots: 100,
    disbursedAmount: 1800000,
    isRecurring: true
  },
  {
    id: '3',
    name: 'Women in Leadership Grant',
    sponsor: 'Gender Equality Fund',
    status: 'ACTIVE',
    startYear: 2023,
    endYear: 2028,
    totalBeneficiaries: 150,
    currentYearBeneficiaries: 75,
    amount: 15000,
    availableSlots: 25,
    totalSlots: 75,
    disbursedAmount: 750000,
    isRecurring: true
  },
  {
    id: '4',
    name: 'Rural Development Scholarship',
    sponsor: 'Community Partners',
    status: 'DRAFT',
    startYear: 2025,
    endYear: 2030,
    totalBeneficiaries: 0,
    currentYearBeneficiaries: 0,
    amount: 18000,
    availableSlots: 50,
    totalSlots: 50,
    disbursedAmount: 0,
    isRecurring: false
  },
]

export default function ScholarshipManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')

  const filteredScholarships = mockScholarships.filter(scholarship => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.sponsor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || scholarship.status === statusFilter
    const matchesYear = yearFilter === 'all' || 
                       (yearFilter === 'current' && scholarship.startYear <= 2025 && (!scholarship.endYear || scholarship.endYear >= 2025))
    
    return matchesSearch && matchesStatus && matchesYear
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'au-badge au-badge-success'
      case 'DRAFT':
        return 'au-badge au-badge-secondary'
      case 'INACTIVE':
        return 'au-badge au-badge-warning'
      case 'ARCHIVED':
        return 'au-badge au-badge-error'
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
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Scholarship Management</h1>
                  <p className="text-gray-600">Manage and monitor all scholarship programs</p>
                </div>
                <Link to="/dev-office/scholarships/create">
                  <Button className="au-btn-primary flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Scholarship
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="au-stat-section au-section-gray-textured">
            <div className="container mx-auto">
              <div className="au-stat-grid">
                <div className="au-stat-item">
                  <span className="au-stat-number">{mockScholarships.filter(s => s.status === 'ACTIVE').length}</span>
                  <span className="au-stat-label">Active Scholarships</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{mockScholarships.reduce((sum, s) => sum + s.currentYearBeneficiaries, 0)}</span>
                  <span className="au-stat-label">Current Beneficiaries</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">${(mockScholarships.reduce((sum, s) => sum + s.disbursedAmount, 0) / 1000000).toFixed(1)}M</span>
                  <span className="au-stat-label">Total Disbursed</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{mockScholarships.reduce((sum, s) => sum + s.availableSlots, 0)}</span>
                  <span className="au-stat-label">Available Slots</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-8 py-8">
            {/* Filters */}
            <PatternWrapper pattern="dots" className="au-card mb-6">
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search scholarships..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="current">Current Year</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PatternWrapper>

            {/* Scholarships Table */}
            <PatternWrapper pattern="geometric" className="au-card">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scholarship Name</TableHead>
                        <TableHead>Sponsor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Beneficiaries</TableHead>
                        <TableHead>Available Slots</TableHead>
                        <TableHead>Total Disbursed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredScholarships.map((scholarship) => (
                        <TableRow key={scholarship.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{scholarship.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {scholarship.isRecurring && (
                                  <span className="text-xs text-gray-500">Recurring</span>
                                )}
                                <span className="text-xs text-blue-600">6 cycles</span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">Current: 2025-2026</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{scholarship.sponsor}</TableCell>
                          <TableCell>
                            <span className={getStatusBadge(scholarship.status)}>
                              {scholarship.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="text-sm">
                                {scholarship.startYear} - {scholarship.endYear || 'Ongoing'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1 text-gray-400" />
                                <span className="font-semibold">{scholarship.currentYearBeneficiaries}</span>
                                <span className="text-xs text-gray-500 ml-1">/ year</span>
                              </div>
                              <span className="text-xs text-gray-500">Total: {scholarship.totalBeneficiaries}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="font-semibold">{scholarship.availableSlots}</span>
                              <span className="text-xs text-gray-500 ml-1">/ {scholarship.totalSlots}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 text-gray-400" />
                              <span className="font-semibold">
                                ${(scholarship.disbursedAmount / 1000000).toFixed(1)}M
                              </span>
                            </div>
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
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Scholarship
                                </DropdownMenuItem>
                                <Link to="/dev-office/scholarships/$id/cycles" params={{ id: scholarship.id }}>
                                  <DropdownMenuItem>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Manage Cycles
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem>
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  View Analytics
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Archive className="w-4 h-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
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
        </div>
      </Main>
    </>
  )
}