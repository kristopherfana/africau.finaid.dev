import { Button } from '@/components/ui/button'
import { Filter, Search, Calendar, TrendingUp, Users, Download, Eye } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input'
import { Main } from '@/components/layout/main';
import { PatternWrapper } from '@/components/au-showcase'
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { useBeneficiaries } from '@/hooks/use-beneficiaries';
import { useActiveScholarships } from '@/hooks/use-scholarships';
import { useState } from 'react'

interface BeneficiaryScholarship {
  id: string;
  name: string;
  amount: number;
  status: string;
}

interface Beneficiary {
  id: string;
  name: string;
  email: string;
  scholarships: BeneficiaryScholarship[];
}

interface BeneficiariesResponse {
  beneficiaries: Beneficiary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}


export default function BeneficiariesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [scholarshipFilter, setScholarshipFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)

  const { data, isLoading } = useBeneficiaries({
    scholarshipId: scholarshipFilter === 'all' ? undefined : scholarshipFilter,
    page,
    pageSize,
    searchTerm,
  });

  const { data: scholarshipsData } = useActiveScholarships();

  const beneficiariesData = data as BeneficiariesResponse;

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
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Beneficiary Management</h1>
                  <p className="text-gray-600">Manage and view scholarship beneficiaries with yearly tracking</p>
                </div>
                <Button className="au-btn-secondary flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Beneficiaries Report
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="au-stat-section au-section-gray-textured">
            <div className="container mx-auto">
              <div className="au-stat-grid">
                <div className="au-stat-item">
                  <span className="au-stat-number">{beneficiariesData?.pagination?.total || 0}</span>
                  <span className="au-stat-label">Total Beneficiaries</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">${(beneficiariesData?.beneficiaries?.reduce((sum: number, b: Beneficiary) => sum + b.scholarships.reduce((s: number, sc: BeneficiaryScholarship) => s + sc.amount, 0), 0) / 1000000 || 0).toFixed(1)}M</span>
                  <span className="au-stat-label">Total Awarded</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{beneficiariesData?.beneficiaries?.reduce((sum: number, b: Beneficiary) => sum + b.scholarships.length, 0) || 0}</span>
                  <span className="au-stat-label">Total Scholarships</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{beneficiariesData?.beneficiaries?.filter((b: Beneficiary) => b.scholarships.some((s: BeneficiaryScholarship) => s.status === 'active')).length || 0}</span>
                  <span className="au-stat-label">Active Recipients</span>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-8 py-8">
            {/* Filters */}
            <PatternWrapper pattern="geometric" className="au-card mb-6">
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search beneficiaries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={scholarshipFilter} onValueChange={setScholarshipFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by Scholarship" />
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
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PatternWrapper>

            {/* Beneficiaries Table */}
            <PatternWrapper pattern="grid" className="au-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">All Beneficiaries</h3>
                  <div className="text-sm text-gray-600">
                    {beneficiariesData?.pagination?.total || 0} beneficiaries
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
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                            <div className="w-20 h-4 bg-gray-200 rounded"></div>
                            <div className="w-24 h-4 bg-gray-200 rounded"></div>
                            <div className="w-16 h-8 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Scholarships</TableHead>
                            <TableHead>Total Received</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {beneficiariesData?.beneficiaries?.length ? (
                            beneficiariesData.beneficiaries.map((beneficiary) => (
                              <TableRow key={beneficiary.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{beneficiary.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{beneficiary.email}</TableCell>
                                <TableCell>
                                  <span className="font-medium">{beneficiary.scholarships.length}</span>
                                  <span className="text-xs text-gray-500 ml-1">scholarship{beneficiary.scholarships.length !== 1 ? 's' : ''}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium text-green-600">
                                    ${beneficiary.scholarships.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className={`au-badge ${beneficiary.scholarships.some(s => s.status === 'active') ? 'au-badge-success' : 'au-badge-secondary'}`}>
                                    {beneficiary.scholarships.some(s => s.status === 'active') ? 'Active' : 'Completed'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" onClick={() => setSelectedBeneficiary(beneficiary)}>
                                        <Eye className="w-4 h-4 mr-1" />
                                        View Details
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Beneficiary Details</DialogTitle>
                                        <DialogDescription>
                                          Complete scholarship history and information
                                        </DialogDescription>
                                      </DialogHeader>
                                      {selectedBeneficiary && (
                                        <div className="space-y-6">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Name</label>
                                              <p className="text-lg font-semibold">{selectedBeneficiary.name}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Email</label>
                                              <p className="text-lg">{selectedBeneficiary.email}</p>
                                            </div>
                                          </div>

                                          <div>
                                            <h4 className="font-semibold mb-3">Scholarship History</h4>
                                            <div className="space-y-3">
                                              {selectedBeneficiary.scholarships.map((scholarship, index) => (
                                                <div key={index} className="border rounded-lg p-4">
                                                  <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-medium">{scholarship.name}</h5>
                                                    <span className={`au-badge ${scholarship.status === 'active' ? 'au-badge-success' : 'au-badge-secondary'}`}>
                                                      {scholarship.status}
                                                    </span>
                                                  </div>
                                                  <div className="text-sm text-gray-600">
                                                    <p>Amount: <span className="font-medium text-green-600">${scholarship.amount.toLocaleString()}</span></p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                              <div>
                                                <span className="text-gray-600">Total Scholarships:</span>
                                                <span className="font-medium ml-2">{selectedBeneficiary.scholarships.length}</span>
                                              </div>
                                              <div>
                                                <span className="text-gray-600">Total Amount Received:</span>
                                                <span className="font-medium text-green-600 ml-2">
                                                  ${selectedBeneficiary.scholarships.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                No results.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
                {beneficiariesData?.pagination && beneficiariesData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(prev => Math.min(beneficiariesData.pagination.totalPages, prev + 1))}
                      disabled={page >= beneficiariesData.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </PatternWrapper>
          </div>
        </div>
      </Main>
    </>
  );
}
