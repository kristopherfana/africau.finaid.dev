import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  ArrowLeft,
  Calendar,
  Plus,
  Edit,
  Eye,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface ScholarshipCycle {
  id: string
  academicYear: string
  amount: number
  totalSlots: number
  availableSlots: number
  applicationStartDate: string
  applicationEndDate: string
  status: 'PLANNING' | 'OPEN' | 'CLOSED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  cycleOrder: number
  applications: number
  beneficiaries: number
  disbursed: number
  notes?: string
}

const mockScholarship = {
  id: '1',
  name: 'Africa University Excellence Award',
  sponsor: 'AU Foundation',
  startYear: 2020,
  endYear: null,
  isRecurring: true,
  status: 'ACTIVE'
}

const mockCycles: ScholarshipCycle[] = [
  {
    id: '1',
    academicYear: '2023-2024',
    amount: 25000,
    totalSlots: 50,
    availableSlots: 0,
    applicationStartDate: '2023-01-15',
    applicationEndDate: '2023-03-15',
    status: 'COMPLETED',
    cycleOrder: 4,
    applications: 156,
    beneficiaries: 50,
    disbursed: 1250000
  },
  {
    id: '2',
    academicYear: '2024-2025',
    amount: 26000,
    totalSlots: 55,
    availableSlots: 5,
    applicationStartDate: '2024-01-15',
    applicationEndDate: '2024-03-15',
    status: 'ACTIVE',
    cycleOrder: 5,
    applications: 142,
    beneficiaries: 50,
    disbursed: 1300000
  },
  {
    id: '3',
    academicYear: '2025-2026',
    amount: 27000,
    totalSlots: 60,
    availableSlots: 60,
    applicationStartDate: '2025-01-15',
    applicationEndDate: '2025-03-15',
    status: 'OPEN',
    cycleOrder: 6,
    applications: 89,
    beneficiaries: 0,
    disbursed: 0
  },
  {
    id: '4',
    academicYear: '2026-2027',
    amount: 27000,
    totalSlots: 60,
    availableSlots: 60,
    applicationStartDate: '2026-01-15',
    applicationEndDate: '2026-03-15',
    status: 'PLANNING',
    cycleOrder: 7,
    applications: 0,
    beneficiaries: 0,
    disbursed: 0
  }
]

export default function ScholarshipCycles() {
  const [cycles, setCycles] = useState(mockCycles)
  const [selectedCycle, setSelectedCycle] = useState<ScholarshipCycle | null>(null)
  const [editingCycle, setEditingCycle] = useState<ScholarshipCycle | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return <Badge variant="secondary">Planning</Badge>
      case 'OPEN':
        return <Badge variant="default" className="bg-green-600">Open</Badge>
      case 'CLOSED':
        return <Badge variant="destructive">Closed</Badge>
      case 'ACTIVE':
        return <Badge variant="default" className="bg-blue-600">Active</Badge>
      case 'COMPLETED':
        return <Badge variant="outline">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const createNextCycle = () => {
    const lastCycle = cycles[cycles.length - 1]
    const nextYear = parseInt(lastCycle.academicYear.split('-')[0]) + 1
    const newCycle: ScholarshipCycle = {
      id: Date.now().toString(),
      academicYear: `${nextYear}-${nextYear + 1}`,
      amount: lastCycle.amount,
      totalSlots: lastCycle.totalSlots,
      availableSlots: lastCycle.totalSlots,
      applicationStartDate: `${nextYear}-01-15`,
      applicationEndDate: `${nextYear}-03-15`,
      status: 'PLANNING',
      cycleOrder: lastCycle.cycleOrder + 1,
      applications: 0,
      beneficiaries: 0,
      disbursed: 0
    }
    setCycles([...cycles, newCycle])
  }

  const updateCycle = (updatedCycle: ScholarshipCycle) => {
    setCycles(cycles.map(cycle => 
      cycle.id === updatedCycle.id ? updatedCycle : cycle
    ))
    setEditingCycle(null)
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
                <div className="flex items-center gap-4">
                  <Link to="/dev-office/scholarships">
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Scholarships
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{mockScholarship.name}</h1>
                    <p className="text-gray-600">Manage yearly cycles and track performance over time</p>
                  </div>
                </div>
                <Button onClick={createNextCycle} className="au-btn-primary flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Next Cycle
                </Button>
              </div>
            </div>
          </div>

          {/* Program Overview */}
          <div className="container mx-auto px-8 py-6">
            <div className="au-grid au-grid-4 mb-8">
              <PatternWrapper pattern="dots" className="au-card">
                <div className="p-6 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                  <div className="text-2xl font-bold">{cycles.length}</div>
                  <div className="text-sm text-gray-600">Total Cycles</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Since {mockScholarship.startYear}
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="geometric" className="au-card">
                <div className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-green-600" />
                  <div className="text-2xl font-bold">
                    {cycles.reduce((sum, c) => sum + c.beneficiaries, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Beneficiaries</div>
                  <div className="text-xs text-gray-500 mt-1">
                    All cycles combined
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="grid" className="au-card">
                <div className="p-6 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
                  <div className="text-2xl font-bold">
                    ${(cycles.reduce((sum, c) => sum + c.disbursed, 0) / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Total Disbursed</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Program lifetime
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="dots" className="au-card">
                <div className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <div className="text-2xl font-bold">
                    {cycles.filter(c => c.status === 'OPEN' || c.status === 'ACTIVE').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Cycles</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Currently running
                  </div>
                </div>
              </PatternWrapper>
            </div>

            {/* Cycles Table */}
            <PatternWrapper pattern="geometric" className="au-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Scholarship Cycles</h3>
                  <div className="text-sm text-gray-600">
                    {mockScholarship.isRecurring ? 'Recurring Program' : 'Fixed-term Program'}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Slots</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Beneficiaries</TableHead>
                        <TableHead>Disbursed</TableHead>
                        <TableHead>Application Period</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cycles.map((cycle) => (
                        <TableRow key={cycle.id}>
                          <TableCell className="font-medium">
                            {cycle.academicYear}
                            <div className="text-xs text-gray-500">
                              Cycle #{cycle.cycleOrder}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(cycle.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 text-gray-400 mr-1" />
                              {cycle.amount.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {cycle.availableSlots}/{cycle.totalSlots}
                              <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-blue-500 h-1 rounded-full"
                                  style={{ width: `${((cycle.totalSlots - cycle.availableSlots) / cycle.totalSlots) * 100}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{cycle.applications}</TableCell>
                          <TableCell>{cycle.beneficiaries}</TableCell>
                          <TableCell>
                            {cycle.disbursed > 0 ? 
                              `$${(cycle.disbursed / 1000000).toFixed(1)}M` : 
                              '-'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {new Date(cycle.applicationStartDate).toLocaleDateString()} - 
                              <br />
                              {new Date(cycle.applicationEndDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedCycle(cycle)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Cycle Details: {cycle.academicYear}</DialogTitle>
                                    <DialogDescription>
                                      Detailed information for this scholarship cycle
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedCycle && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium">Status</Label>
                                          <div className="mt-1">{getStatusBadge(selectedCycle.status)}</div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Award Amount</Label>
                                          <div className="mt-1">${selectedCycle.amount.toLocaleString()}</div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Total Slots</Label>
                                          <div className="mt-1">{selectedCycle.totalSlots}</div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Available Slots</Label>
                                          <div className="mt-1">{selectedCycle.availableSlots}</div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Applications Received</Label>
                                          <div className="mt-1">{selectedCycle.applications}</div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Current Beneficiaries</Label>
                                          <div className="mt-1">{selectedCycle.beneficiaries}</div>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Application Period</Label>
                                        <div className="mt-1">
                                          {new Date(selectedCycle.applicationStartDate).toLocaleDateString()} to {' '}
                                          {new Date(selectedCycle.applicationEndDate).toLocaleDateString()}
                                        </div>
                                      </div>
                                      {selectedCycle.notes && (
                                        <div>
                                          <Label className="text-sm font-medium">Notes</Label>
                                          <div className="mt-1 text-sm text-gray-600">{selectedCycle.notes}</div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              {(cycle.status === 'PLANNING' || cycle.status === 'OPEN') && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setEditingCycle(cycle)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Edit Cycle: {cycle.academicYear}</DialogTitle>
                                      <DialogDescription>
                                        Modify the settings for this scholarship cycle
                                      </DialogDescription>
                                    </DialogHeader>
                                    {editingCycle && (
                                      <CycleEditForm 
                                        cycle={editingCycle}
                                        onSave={updateCycle}
                                        onCancel={() => setEditingCycle(null)}
                                      />
                                    )}
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
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

function CycleEditForm({ 
  cycle, 
  onSave, 
  onCancel 
}: { 
  cycle: ScholarshipCycle
  onSave: (cycle: ScholarshipCycle) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(cycle)

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Award Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalSlots">Total Slots</Label>
          <Input
            id="totalSlots"
            type="number"
            value={formData.totalSlots}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              totalSlots: parseInt(e.target.value),
              availableSlots: parseInt(e.target.value) - (cycle.totalSlots - cycle.availableSlots)
            }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Application Start</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.applicationStartDate}
            onChange={(e) => setFormData(prev => ({ ...prev, applicationStartDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Application End</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.applicationEndDate}
            onChange={(e) => setFormData(prev => ({ ...prev, applicationEndDate: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any special notes or adjustments for this cycle..."
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} className="au-btn-primary">Save Changes</Button>
      </DialogFooter>
    </div>
  )
}