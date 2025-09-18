import {
  Building2,
  DollarSign,
  Edit,
  Filter,
  Globe,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash,
  Users,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Input } from '@/components/ui/input'
import { Main } from '@/components/layout/main'
import { PatternWrapper } from '@/components/au-showcase'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { apiClient } from '@/lib/api'
import { useActiveScholarships } from '@/hooks/use-scholarships'
import { useBeneficiaries } from '@/hooks/use-beneficiaries'
import { useState } from 'react'

interface Sponsor {
  id: string
  name: string
  type: 'INDIVIDUAL' | 'ORGANIZATION' | 'GOVERNMENT'
  contactPerson: string | null
  email: string | null
  phone: string | null
  website?: string | null
  address: string | null
  logoUrl: string | null
  totalFunding: number
  isActive: boolean
}

// API functions
const fetchSponsors = async (): Promise<Sponsor[]> => {
  const response = await apiClient.get<Sponsor[]>('/sponsors');
  return response;
};

const createSponsor = async (newSponsor: Omit<Sponsor, 'id' | 'totalFunding' | 'isActive'>): Promise<Sponsor> => {
  const response = await apiClient.post<Sponsor>('/sponsors', newSponsor);
  return response;
};

const updateSponsor = async (updatedSponsor: Partial<Sponsor> & { id: string }): Promise<Sponsor> => {
  const { id, ...data } = updatedSponsor;
  const response = await apiClient.patch<Sponsor>(`/sponsors/${id}`, data);
  return response;
};

const deleteSponsor = async (id: string): Promise<void> => {
  const response = await apiClient.delete<void>(`/sponsors/${id}`);
  return response;
};

export default function Sponsors() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: sponsors = [], isLoading } = useQuery<Sponsor[]>({
    queryKey: ['sponsors'],
    queryFn: fetchSponsors
  });

  const { data: scholarshipsData } = useActiveScholarships();
  const { data: beneficiariesData } = useBeneficiaries({ status: 'APPROVED', page: 1, pageSize: 1 });

  const createMutation = useMutation({ 
    mutationFn: createSponsor, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({ 
    mutationFn: updateSponsor, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      setIsDialogOpen(false);
      setEditingSponsor(null);
    }
  });

  const deleteMutation = useMutation({ 
    mutationFn: deleteSponsor, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    }
  });

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sponsor.contactPerson && sponsor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === 'all' || sponsor.type === typeFilter
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'ACTIVE' && sponsor.isActive) || (statusFilter === 'INACTIVE' && !sponsor.isActive)

    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ORGANIZATION': return <Building2 className="w-4 h-4 text-blue-600" />
      case 'INDIVIDUAL': return <Users className="w-4 h-4 text-purple-600" />
      case 'GOVERNMENT': return <Building2 className="w-4 h-4 text-red-600" />
      default: return <Building2 className="w-4 h-4" />
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return 'au-badge au-badge-success'
    } else {
      return 'au-badge au-badge-error'
    }
  }

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setIsDialogOpen(true);
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (editingSponsor) {
      const sponsorData: Partial<Sponsor> = {
        name: formData.get('name') as string,
        type: formData.get('type') as 'INDIVIDUAL' | 'ORGANIZATION' | 'GOVERNMENT',
        contactPerson: formData.get('contactPerson') as string || null,
        email: formData.get('email') as string || null,
      };
      updateMutation.mutate({ id: editingSponsor.id, ...sponsorData });
    } else {
      const sponsorData = {
        name: formData.get('name') as string,
        type: formData.get('type') as 'INDIVIDUAL' | 'ORGANIZATION' | 'GOVERNMENT',
        contactPerson: formData.get('contactPerson') as string || null,
        email: formData.get('email') as string || null,
        phone: null,
        website: null,
        address: null,
        logoUrl: null,
      };
      createMutation.mutate(sponsorData);
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
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Sponsor Management</h1>
                  <p className="text-gray-600">Manage relationships with scholarship sponsors and funding partners</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="au-btn-primary flex items-center" onClick={() => setEditingSponsor(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Sponsor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}</DialogTitle>
                      <DialogDescription>
                        {editingSponsor ? 'Update the details of the sponsor.' : 'Enter the details of the new sponsor organization or individual.'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Sponsor Name</label>
                          <Input name="name" placeholder="Enter sponsor name..." defaultValue={editingSponsor?.name} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Type</label>
                          <Select name="type" defaultValue={editingSponsor?.type}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sponsor type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ORGANIZATION">Organization</SelectItem>
                              <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                              <SelectItem value="GOVERNMENT">Government</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Contact Person</label>
                          <Input name="contactPerson" placeholder="Enter contact person name..." defaultValue={editingSponsor?.contactPerson || ''} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input name="email" type="email" placeholder="Enter email address..." defaultValue={editingSponsor?.email || ''} />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" className="au-btn-primary">{editingSponsor ? 'Save Changes' : 'Add Sponsor'}</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="au-stat-section au-section-gray-textured">
            <div className="container mx-auto">
              <div className="au-stat-grid">
                <div className="au-stat-item">
                  <span className="au-stat-number">{sponsors.filter(s => s.isActive).length}</span>
                  <span className="au-stat-label">Active Sponsors</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">${(sponsors.reduce((sum, s) => sum + s.totalFunding, 0) / 1000000).toFixed(1)}M</span>
                  <span className="au-stat-label">Total Contributions</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{scholarshipsData?.data?.length || 0}</span>
                  <span className="au-stat-label">Active Scholarships</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{(beneficiariesData as any)?.pagination?.total || 0}</span>
                  <span className="au-stat-label">Students Supported</span>
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
                        placeholder="Search sponsors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ORGANIZATION">Organization</SelectItem>
                      <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      <SelectItem value="GOVERNMENT">Government</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PatternWrapper>

            {/* Sponsors Table */}
            <PatternWrapper pattern="grid" className="au-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">All Sponsors</h3>
                  <div className="text-sm text-gray-600">
                    {filteredSponsors.length} of {sponsors.length} sponsors
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sponsor</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Total Funding</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                        </TableRow>
                      ) : filteredSponsors.map((sponsor) => (
                        <TableRow key={sponsor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {getTypeIcon(sponsor.type)}
                              <div>
                                <div className="font-semibold">{sponsor.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{sponsor.contactPerson}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {sponsor.email}
                              </div>
                              {sponsor.phone && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {sponsor.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 text-gray-400" />
                              <span className="font-semibold">
                                ${(sponsor.totalFunding / 1000000).toFixed(2)}M
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={getStatusBadge(sponsor.isActive)}>
                              {sponsor.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
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
                                <DropdownMenuItem onSelect={() => handleEdit(sponsor)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => deleteMutation.mutate(sponsor.id)}>
                                  <Trash className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                                {sponsor.website && (
                                  <DropdownMenuItem onSelect={() => window.open(sponsor.website!, '_blank')}>
                                    <Globe className="w-4 h-4 mr-2" />
                                    Visit Website
                                  </DropdownMenuItem>
                                )}
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