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
  Copy,
  Loader2
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
import { useScholarships } from '@/hooks/use-scholarships'
import type { Scholarship } from '@/types/scholarship'

interface DisplayScholarship {
  id: string
  name: string
  sponsor: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'SUSPENDED'
  amount: number
  maxRecipients: number
  currentApplications: number
  applicationStartDate: string
  applicationDeadline: string
  createdAt: string
}

// Helper function to map API scholarship data to display format
const mapScholarshipToDisplay = (scholarship: Scholarship): DisplayScholarship => ({
  id: scholarship.id,
  name: scholarship.name,
  sponsor: scholarship.sponsor,
  status: scholarship.status, // Direct mapping since both frontend and backend now have the same status values
  amount: scholarship.amount,
  maxRecipients: scholarship.maxRecipients,
  currentApplications: scholarship.currentApplications,
  applicationStartDate: scholarship.applicationStartDate,
  applicationDeadline: scholarship.applicationDeadline,
  createdAt: scholarship.createdAt
})

export default function ScholarshipManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')

  // Fetch scholarships from backend
  const { data: scholarshipsResponse, isLoading, error } = useScholarships({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const scholarships = scholarshipsResponse?.data || []
  const displayScholarships = scholarships.map(mapScholarshipToDisplay)

  const filteredScholarships = displayScholarships.filter(scholarship => {
    const matchesSearch = searchTerm === '' ||
                         scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.sponsor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || scholarship.status === statusFilter
    const currentYear = new Date().getFullYear()
    const startYear = new Date(scholarship.applicationStartDate).getFullYear()
    const endYear = new Date(scholarship.applicationDeadline).getFullYear()
    const matchesYear = yearFilter === 'all' ||
                       (yearFilter === 'current' && startYear <= currentYear && endYear >= currentYear) ||
                       yearFilter === startYear.toString()

    return matchesSearch && matchesStatus && matchesYear
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'au-badge au-badge-success'
      case 'CLOSED':
        return 'au-badge au-badge-warning'
      case 'SUSPENDED':
        return 'au-badge au-badge-error'
      case 'DRAFT':
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
                  <span className="au-stat-number">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      displayScholarships.filter(s => s.status === 'OPEN').length
                    )}
                  </span>
                  <span className="au-stat-label">Active Scholarships</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      displayScholarships.reduce((sum, s) => sum + s.currentApplications, 0)
                    )}
                  </span>
                  <span className="au-stat-label">Total Applications</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      `$${(displayScholarships.reduce((sum, s) => sum + s.amount, 0) / 1000).toFixed(0)}K`
                    )}
                  </span>
                  <span className="au-stat-label">Total Scholarship Value</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      displayScholarships.reduce((sum, s) => sum + s.maxRecipients, 0)
                    )}
                  </span>
                  <span className="au-stat-label">Total Slots</span>
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
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
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
                {error && (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-2">Error loading scholarships</div>
                    <div className="text-sm text-gray-500">{error.message}</div>
                  </div>
                )}
                {isLoading && (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <div className="text-gray-500">Loading scholarships...</div>
                  </div>
                )}
                {!isLoading && !error && filteredScholarships.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No scholarships found</div>
                    <div className="text-sm text-gray-400">Try adjusting your search or filters</div>
                  </div>
                )}
                {!isLoading && !error && filteredScholarships.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Program Name</TableHead>
                          <TableHead>Sponsor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Latest Application Period</TableHead>
                          <TableHead>Total Applications</TableHead>
                          <TableHead>Default Amount</TableHead>
                          <TableHead>Default Recipients</TableHead>
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
                                  <span className="text-xs text-blue-600">ID: {scholarship.id.slice(0, 8)}...</span>
                                  <span className="text-xs text-gray-500">•</span>
                                  <span className="text-xs text-gray-500">
                                    Created: {new Date(scholarship.createdAt).toLocaleDateString()}
                                  </span>
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
                              <div className="text-sm">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                  <span>Start: {new Date(scholarship.applicationStartDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-gray-500">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  <span>End: {new Date(scholarship.applicationDeadline).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1 text-gray-400" />
                                <span className="font-semibold">{scholarship.currentApplications}</span>
                                <span className="text-xs text-gray-500 ml-1">applications</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <DollarSign className="w-3 h-3 text-gray-400" />
                                <span className="font-semibold">
                                  ${scholarship.amount.toLocaleString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="font-semibold">{scholarship.maxRecipients}</span>
                                <span className="text-xs text-gray-500 ml-1">max</span>
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
                                <Link to="/dev-office/scholarships/$id/" params={{ id: scholarship.id }}>
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                </Link>
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
                                <Link to="/dev-office/scholarships/$id/" params={{ id: scholarship.id }}>
                                  <DropdownMenuItem>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                </Link>
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
                )}
              </div>
            </PatternWrapper>
          </div>
        </div>
      </Main>
    </>
  )
}