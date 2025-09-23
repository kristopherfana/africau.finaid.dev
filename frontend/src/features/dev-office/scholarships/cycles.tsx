import { useState, useEffect } from 'react'
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
import { Link, useParams } from '@tanstack/react-router'
import { scholarshipsAPI } from '@/lib/api'
import { Scholarship } from '@/types/scholarship'

interface ScholarshipCycle {
  id: string
  name: string
  academicYear?: string
  amount: number
  maxRecipients: number
  currentApplications: number
  applicationStartDate: string
  applicationDeadline: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'SUSPENDED'
  sponsor: string
  description?: string
}

export default function ScholarshipCycles() {
  const { id: programId } = useParams({ from: '/_authenticated/dev-office/scholarships/$id/cycles' })
  const [cycles, setCycles] = useState<ScholarshipCycle[]>([])
  const [selectedCycle, setSelectedCycle] = useState<ScholarshipCycle | null>(null)
  const [editingCycle, setEditingCycle] = useState<ScholarshipCycle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [programInfo, setProgramInfo] = useState<{
    name: string;
    sponsor: string;
    startYear?: number;
    isRecurring?: boolean;
  } | null>(null)

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await scholarshipsAPI.getCyclesByProgram(programId)

        // Convert Scholarship[] to ScholarshipCycle[]
        const convertedCycles: ScholarshipCycle[] = data.map((cycle: Scholarship) => {
          // Extract academic year from name if available
          const nameMatch = cycle.name.match(/(\d{4}-\d{4})/);
          const academicYear = nameMatch ? nameMatch[1] : new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);

          return {
            id: cycle.id,
            name: cycle.name,
            academicYear,
            amount: cycle.amount,
            maxRecipients: cycle.maxRecipients,
            currentApplications: cycle.currentApplications,
            applicationStartDate: new Date(cycle.applicationStartDate).toISOString().split('T')[0],
            applicationDeadline: new Date(cycle.applicationDeadline).toISOString().split('T')[0],
            status: cycle.status,
            sponsor: cycle.sponsor,
            description: cycle.description
          }
        })

        setCycles(convertedCycles)

        // Set program info from the first cycle
        if (convertedCycles.length > 0) {
          const firstCycle = convertedCycles[0]
          setProgramInfo({
            name: firstCycle.name.replace(/\s+\d{4}-\d{4}/, ''), // Remove year from name
            sponsor: firstCycle.sponsor,
            startYear: 2020, // Default, could be calculated from cycles
            isRecurring: true // Default assumption
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scholarship cycles')
      } finally {
        setLoading(false)
      }
    }

    fetchCycles()
  }, [programId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>
      case 'OPEN':
        return <Badge variant="default" className="bg-green-600">Open</Badge>
      case 'CLOSED':
        return <Badge variant="destructive">Closed</Badge>
      case 'SUSPENDED':
        return <Badge variant="outline">Suspended</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const createNextCycle = async () => {
    if (cycles.length === 0) return

    const lastCycle = cycles[0] // Most recent cycle
    const nextYear = new Date().getFullYear() + 1
    const academicYear = `${nextYear}-${nextYear + 1}`

    try {
      const newCycleData = {
        name: `${programInfo?.name} ${academicYear}`,
        description: lastCycle.description || '',
        amount: lastCycle.amount,
        maxRecipients: lastCycle.maxRecipients,
        applicationStartDate: `${nextYear}-01-15`,
        applicationDeadline: `${nextYear}-03-15`,
        status: 'DRAFT'
      }

      const newCycle = await scholarshipsAPI.create(newCycleData)

      // Convert to ScholarshipCycle and add to list
      const convertedCycle: ScholarshipCycle = {
        id: newCycle.id,
        name: newCycle.name,
        academicYear,
        amount: newCycle.amount,
        maxRecipients: newCycle.maxRecipients,
        currentApplications: newCycle.currentApplications,
        applicationStartDate: new Date(newCycle.applicationStartDate).toISOString().split('T')[0],
        applicationDeadline: new Date(newCycle.applicationDeadline).toISOString().split('T')[0],
        status: newCycle.status,
        sponsor: newCycle.sponsor,
        description: newCycle.description
      }

      setCycles([convertedCycle, ...cycles])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create new cycle')
    }
  }

  const updateCycle = (updatedCycle: ScholarshipCycle) => {
    setCycles(cycles.map(cycle => 
      cycle.id === updatedCycle.id ? updatedCycle : cycle
    ))
    setEditingCycle(null)
  }

  if (loading) {
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
        <Main className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading scholarship cycles...</p>
            </div>
          </div>
        </Main>
      </>
    )
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
        <Main className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-2">Error loading scholarship cycles</p>
              <p className="text-gray-600">{error}</p>
            </div>
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {programInfo?.name || 'Scholarship Program'}
                    </h1>
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
                    Since {programInfo?.startYear || 2020}
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="geometric" className="au-card">
                <div className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-green-600" />
                  <div className="text-2xl font-bold">
                    {cycles.reduce((sum, c) => sum + (c.maxRecipients - (c.maxRecipients - c.currentApplications)), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                  <div className="text-xs text-gray-500 mt-1">
                    All cycles combined
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="grid" className="au-card">
                <div className="p-6 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
                  <div className="text-2xl font-bold">
                    ${(cycles.reduce((sum, c) => sum + c.amount, 0) / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                  <div className="text-xs text-gray-500 mt-1">
                    All cycles combined
                  </div>
                </div>
              </PatternWrapper>

              <PatternWrapper pattern="dots" className="au-card">
                <div className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <div className="text-2xl font-bold">
                    {cycles.filter(c => c.status === 'OPEN').length}
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
                    {programInfo?.isRecurring ? 'Recurring Program' : 'Fixed-term Program'}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cycle Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Application Period</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cycles.map((cycle) => (
                        <TableRow key={cycle.id}>
                          <TableCell className="font-medium">
                            {cycle.name}
                            {cycle.academicYear && (
                              <div className="text-xs text-gray-500">
                                {cycle.academicYear}
                              </div>
                            )}
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
                              {cycle.maxRecipients} max
                              <div className="text-xs text-gray-500">
                                {cycle.currentApplications} applied
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{cycle.currentApplications}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {new Date(cycle.applicationStartDate).toLocaleDateString()} -
                              <br />
                              {new Date(cycle.applicationDeadline).toLocaleDateString()}
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
                                    <DialogTitle>Cycle Details: {cycle.name}</DialogTitle>
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
                                          <Label className="text-sm font-medium">Max Recipients</Label>
                                          <div className="mt-1">{selectedCycle.maxRecipients}</div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Applications Received</Label>
                                          <div className="mt-1">{selectedCycle.currentApplications}</div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Sponsor</Label>
                                          <div className="mt-1">{selectedCycle.sponsor}</div>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Application Period</Label>
                                        <div className="mt-1">
                                          {new Date(selectedCycle.applicationStartDate).toLocaleDateString()} to{' '}
                                          {new Date(selectedCycle.applicationDeadline).toLocaleDateString()}
                                        </div>
                                      </div>
                                      {selectedCycle.description && (
                                        <div>
                                          <Label className="text-sm font-medium">Description</Label>
                                          <div className="mt-1 text-sm text-gray-600">{selectedCycle.description}</div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              {(cycle.status === 'DRAFT' || cycle.status === 'OPEN') && (
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
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      // Call API to update the cycle
      const updateData = {
        name: formData.name,
        amount: formData.amount,
        maxRecipients: formData.maxRecipients,
        applicationStartDate: formData.applicationStartDate,
        applicationDeadline: formData.applicationDeadline,
        description: formData.description
      }

      const updatedCycle = await scholarshipsAPI.update(cycle.id, updateData)

      // Convert back to ScholarshipCycle format
      const convertedCycle: ScholarshipCycle = {
        id: updatedCycle.id,
        name: updatedCycle.name,
        academicYear: formData.academicYear,
        amount: updatedCycle.amount,
        maxRecipients: updatedCycle.maxRecipients,
        currentApplications: updatedCycle.currentApplications,
        applicationStartDate: new Date(updatedCycle.applicationStartDate).toISOString().split('T')[0],
        applicationDeadline: new Date(updatedCycle.applicationDeadline).toISOString().split('T')[0],
        status: updatedCycle.status,
        sponsor: updatedCycle.sponsor,
        description: updatedCycle.description
      }

      onSave(convertedCycle)
    } catch (error) {
      console.error('Failed to update cycle:', error)
    } finally {
      setLoading(false)
    }
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
          <Label htmlFor="maxRecipients">Max Recipients</Label>
          <Input
            id="maxRecipients"
            type="number"
            value={formData.maxRecipients}
            onChange={(e) => setFormData(prev => ({ ...prev, maxRecipients: parseInt(e.target.value) }))}
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
          <Label htmlFor="endDate">Application Deadline</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.applicationDeadline}
            onChange={(e) => setFormData(prev => ({ ...prev, applicationDeadline: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Any special notes or description for this cycle..."
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} className="au-btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </div>
  )
}