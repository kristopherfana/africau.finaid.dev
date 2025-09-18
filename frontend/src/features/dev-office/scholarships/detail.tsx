import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Edit,
  FileText,
  Loader2,
  Settings,
  TrendingUp,
  Users
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useCreateScholarship, useDeleteScholarship, useScholarship, useUpdateScholarship } from '@/hooks/use-scholarships'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/main'
import { PatternWrapper } from '@/components/au-showcase'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Textarea } from '@/components/ui/textarea'
import { ThemeSwitch } from '@/components/theme-switch'
import { toast } from 'sonner'

export default function ScholarshipDetail() {
  const { id } = useParams({ from: '/_authenticated/dev-office/scholarships/$id/' })
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    amount: '',
    sponsor: '',
    type: '',
    maxRecipients: '',
    applicationStartDate: '',
    applicationDeadline: '',
    eligibilityCriteria: [] as string[],
    status: ''
  })

  // Fetch scholarship data from API
  const { data: scholarship, isLoading, error } = useScholarship(id)
  const updateScholarshipMutation = useUpdateScholarship()
  const deleteScholarshipMutation = useDeleteScholarship()
  const createScholarshipMutation = useCreateScholarship()

  // Initialize edit form when scholarship data loads
  useEffect(() => {
    if (scholarship) {
      setEditFormData({
        name: scholarship.name || '',
        description: scholarship.description || '',
        amount: scholarship.amount?.toString() || '',
        sponsor: scholarship.sponsor || '',
        type: scholarship.type || '',
        maxRecipients: scholarship.maxRecipients?.toString() || '',
        applicationStartDate: scholarship.applicationStartDate ? scholarship.applicationStartDate.split('T')[0] : '',
        applicationDeadline: scholarship.applicationDeadline ? scholarship.applicationDeadline.split('T')[0] : '',
        eligibilityCriteria: scholarship.eligibilityCriteria || [],
        status: scholarship.status || ''
      })
    }
  }, [scholarship])

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updates = {
        name: editFormData.name,
        description: editFormData.description,
        amount: Number(editFormData.amount),
        sponsor: editFormData.sponsor,
        type: editFormData.type,
        maxRecipients: Number(editFormData.maxRecipients),
        applicationStartDate: editFormData.applicationStartDate,
        applicationDeadline: editFormData.applicationDeadline,
        eligibilityCriteria: editFormData.eligibilityCriteria,
        status: editFormData.status
      }

      await updateScholarshipMutation.mutateAsync({ id, updates })
      toast.success('Scholarship updated successfully!')
      setIsEditDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update scholarship.')
    }
  }

  const openEditDialog = () => {
    if (scholarship) {
      setEditFormData({
        name: scholarship.name || '',
        description: scholarship.description || '',
        amount: scholarship.amount?.toString() || '',
        sponsor: scholarship.sponsor || '',
        type: scholarship.type || '',
        maxRecipients: scholarship.maxRecipients?.toString() || '',
        applicationStartDate: scholarship.applicationStartDate ? scholarship.applicationStartDate.split('T')[0] : '',
        applicationDeadline: scholarship.applicationDeadline ? scholarship.applicationDeadline.split('T')[0] : '',
        eligibilityCriteria: scholarship.eligibilityCriteria || [],
        status: scholarship.status || ''
      })
    }
    setIsEditDialogOpen(true)
  }

  const handleDeleteScholarship = async () => {
    try {
      await deleteScholarshipMutation.mutateAsync(id)
      toast.success('Scholarship deleted successfully!')
      setIsDeleteDialogOpen(false)
      navigate({ to: '/_authenticated/dev-office/scholarships' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete scholarship.')
      console.error('Delete error:', error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateScholarshipMutation.mutateAsync({
        id,
        updates: { status: newStatus }
      })
      toast.success(`Scholarship status changed to ${newStatus}!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update scholarship status.')
    }
  }

  const handleDuplicate = async () => {
    if (!scholarship) return

    try {
      const duplicateData = {
        name: `${scholarship.name} (Copy)`,
        description: scholarship.description,
        amount: scholarship.amount,
        sponsor: scholarship.sponsor,
        type: scholarship.type,
        maxRecipients: scholarship.maxRecipients,
        applicationStartDate: scholarship.applicationStartDate,
        applicationDeadline: scholarship.applicationDeadline,
        eligibilityCriteria: scholarship.eligibilityCriteria || [],
        status: 'DRAFT'
      }

      const newScholarship = await createScholarshipMutation.mutateAsync(duplicateData)
      toast.success('Scholarship duplicated successfully!')
      navigate({ to: '/_authenticated/dev-office/scholarships/$id', params: { id: newScholarship.id } })
    } catch (error: any) {
      toast.error(error.message || 'Failed to duplicate scholarship.')
    }
  }

  if (isLoading) {
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
        <Main className="p-0">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading scholarship details...</p>
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
        <Main className="p-0">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Error loading scholarship</p>
              <p className="text-gray-500">{error.message}</p>
              <Link to="/_authenticated/dev-office/scholarships">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Scholarships
                </Button>
              </Link>
            </div>
          </div>
        </Main>
      </>
    )
  }

  if (!scholarship) {
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
        <Main className="p-0">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Scholarship not found</p>
              <p className="text-gray-500">The scholarship you're looking for doesn't exist.</p>
              <Link to="/_authenticated/dev-office/scholarships">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Scholarships
                </Button>
              </Link>
            </div>
          </div>
        </Main>
      </>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'au-badge au-badge-success'
      case 'DRAFT':
        return 'au-badge au-badge-secondary'
      case 'CLOSED':
        return 'au-badge au-badge-warning'
      case 'SUSPENDED':
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
                <div className="flex items-center gap-4">
                  <Link to="/_authenticated/dev-office/scholarships">
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Scholarships
                    </Button>
                  </Link>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-800">{scholarship.name}</h1>
                      <span className={getStatusBadge(scholarship.status)}>
                        {scholarship.status}
                      </span>
                    </div>
                    <p className="text-gray-600">Detailed view and management for this scholarship program</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center" onClick={() => toast.info('Export functionality coming soon!')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button className="au-btn-primary flex items-center" onClick={openEditDialog}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Scholarship
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="au-stat-section au-section-gray-textured">
            <div className="container mx-auto">
              <div className="au-stat-grid">
                <div className="au-stat-item">
                  <span className="au-stat-number">{scholarship.maxRecipients}</span>
                  <span className="au-stat-label">Max Recipients</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">{scholarship.currentApplications}</span>
                  <span className="au-stat-label">Current Applications</span>
                </div>
                <div className="au-stat-item">
                  <span className="au-stat-number">${(scholarship.amount / 1000).toFixed(0)}K</span>
                  <span className="au-stat-label">Award Amount</span>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-8 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="management">Management</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="au-grid au-grid-2">
                  {/* Basic Information */}
                  <PatternWrapper pattern="dots" className="au-card">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Basic Information</h3>
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Description</label>
                          <p className="text-sm mt-1">{scholarship.description || 'No description provided'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Amount</label>
                            <p className="font-semibold">${scholarship.amount?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Type</label>
                            <p className="font-semibold">{scholarship.type}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Max Recipients</label>
                            <p className="font-semibold">{scholarship.maxRecipients}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Current Applications</label>
                            <p className="font-semibold">{scholarship.currentApplications}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PatternWrapper>

                  {/* Sponsor Information */}
                  <PatternWrapper pattern="geometric" className="au-card">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Sponsor Information</h3>
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Organization</label>
                          <p className="font-semibold">{scholarship.sponsor}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Application Start</label>
                            <p className="font-semibold">
                              {scholarship.applicationStartDate
                                ? new Date(scholarship.applicationStartDate).toLocaleDateString()
                                : 'Not set'
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Application Deadline</label>
                            <p className="font-semibold">
                              {scholarship.applicationDeadline
                                ? new Date(scholarship.applicationDeadline).toLocaleDateString()
                                : 'Not set'
                              }
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Created</label>
                          <p className="text-sm">
                            {scholarship.createdAt
                              ? new Date(scholarship.createdAt).toLocaleDateString()
                              : 'Unknown'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </PatternWrapper>
                </div>

                {/* Eligibility Criteria */}
                <PatternWrapper pattern="grid" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Eligibility Criteria</h3>
                      <Award className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="space-y-3">
                      {scholarship.eligibilityCriteria && scholarship.eligibilityCriteria.length > 0 ? (
                        scholarship.eligibilityCriteria.map((criterion, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <span className="font-medium">{criterion}</span>
                            </div>
                            <Badge variant="secondary">
                              Requirement
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          No specific eligibility criteria defined
                        </div>
                      )}
                    </div>
                  </div>
                </PatternWrapper>
              </TabsContent>

              <TabsContent value="management" className="space-y-6">
                <div className="au-grid au-grid-2">
                  {/* Quick Actions */}
                  <PatternWrapper pattern="dots" className="au-card">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                        <Settings className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="space-y-3">
                        <Button className="w-full justify-start" variant="outline" onClick={openEditDialog}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Scholarship Details
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('management')}>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Change Status
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={openEditDialog}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Manage Application Dates
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => toast.info('Export functionality coming soon!')}>
                          <Download className="w-4 h-4 mr-2" />
                          Export Application Data
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => navigate({ to: '/dev-office/scholarships/$id/cycles', params: { id } })}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Manage Cycles
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={handleDuplicate}
                          disabled={createScholarshipMutation.isPending}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {createScholarshipMutation.isPending ? 'Duplicating...' : 'Duplicate Scholarship'}
                        </Button>
                      </div>
                    </div>
                  </PatternWrapper>

                  {/* Status Management */}
                  <PatternWrapper pattern="geometric" className="au-card">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Status Management</h3>
                        <AlertCircle className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Current Status</label>
                          <div className="mt-1">
                            <span className={getStatusBadge(scholarship.status)}>
                              {scholarship.status}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Available Actions</label>
                          <div className="mt-2 space-y-2">
                            {scholarship.status === 'DRAFT' && (
                              <Button
                                size="sm"
                                className="w-full"
                                variant="outline"
                                onClick={() => handleStatusChange('OPEN')}
                                disabled={updateScholarshipMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Publish (Set to Open)
                              </Button>
                            )}
                            {scholarship.status === 'OPEN' && (
                              <Button
                                size="sm"
                                className="w-full"
                                variant="outline"
                                onClick={() => handleStatusChange('CLOSED')}
                                disabled={updateScholarshipMutation.isPending}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Close Applications
                              </Button>
                            )}
                            {scholarship.status === 'CLOSED' && (
                              <Button
                                size="sm"
                                className="w-full"
                                variant="outline"
                                onClick={() => handleStatusChange('OPEN')}
                                disabled={updateScholarshipMutation.isPending}
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Reopen Applications
                              </Button>
                            )}
                            {scholarship.status !== 'SUSPENDED' && (
                              <Button
                                size="sm"
                                className="w-full"
                                variant="outline"
                                onClick={() => handleStatusChange('SUSPENDED')}
                                disabled={updateScholarshipMutation.isPending}
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Suspend Scholarship
                              </Button>
                            )}
                            {scholarship.status === 'SUSPENDED' && (
                              <Button
                                size="sm"
                                className="w-full"
                                variant="outline"
                                onClick={() => handleStatusChange('DRAFT')}
                                disabled={updateScholarshipMutation.isPending}
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Reactivate as Draft
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </PatternWrapper>
                </div>

                {/* Application Management */}
                <PatternWrapper pattern="grid" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Application Management</h3>
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{scholarship.currentApplications}</div>
                        <div className="text-sm text-gray-600">Total Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{scholarship.maxRecipients}</div>
                        <div className="text-sm text-gray-600">Available Slots</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {scholarship.currentApplications > 0 ? Math.round((scholarship.maxRecipients / scholarship.currentApplications) * 100) : 0}%
                        </div>
                        <div className="text-sm text-gray-600">Acceptance Rate</div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button variant="outline" onClick={() => navigate({ to: '/dev-office/reports' })}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Reports
                      </Button>
                    </div>
                  </div>
                </PatternWrapper>

                {/* Danger Zone */}
                <PatternWrapper pattern="dots" className="au-card border-red-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-red-800">Danger Zone</h3>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 mb-2">
                          <strong>Archive Scholarship:</strong> This will hide the scholarship from active listings but preserve all data.
                        </p>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => toast.info('Archive functionality coming soon!')}>
                          Archive Scholarship
                        </Button>
                      </div>
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 mb-2">
                          <strong>Delete Scholarship:</strong> This action cannot be undone. All applications and data will be permanently deleted.
                        </p>
                        <Button size="sm" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                          Delete Scholarship
                        </Button>
                      </div>
                    </div>
                  </div>
                </PatternWrapper>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Main>

      {/* Edit Scholarship Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Scholarship</DialogTitle>
            <DialogDescription>
              Update the scholarship information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sponsor">Sponsor</Label>
                <Input
                  id="edit-sponsor"
                  value={editFormData.sponsor}
                  onChange={(e) => setEditFormData({ ...editFormData, sponsor: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount ($)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL">Full Scholarship</SelectItem>
                    <SelectItem value="PARTIAL">Partial Scholarship</SelectItem>
                    <SelectItem value="MERIT_BASED">Merit Based</SelectItem>
                    <SelectItem value="NEED_BASED">Need Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxRecipients">Max Recipients</Label>
                <Input
                  id="edit-maxRecipients"
                  type="number"
                  value={editFormData.maxRecipients}
                  onChange={(e) => setEditFormData({ ...editFormData, maxRecipients: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-applicationStartDate">Application Start Date</Label>
                <Input
                  id="edit-applicationStartDate"
                  type="date"
                  value={editFormData.applicationStartDate}
                  onChange={(e) => setEditFormData({ ...editFormData, applicationStartDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-applicationDeadline">Application Deadline</Label>
                <Input
                  id="edit-applicationDeadline"
                  type="date"
                  value={editFormData.applicationDeadline}
                  onChange={(e) => setEditFormData({ ...editFormData, applicationDeadline: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateScholarshipMutation.isPending}>
                {updateScholarshipMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Scholarship</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{scholarship?.name}"? This action cannot be undone and will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The scholarship record</li>
                <li>All associated applications</li>
                <li>All application documents</li>
                <li>All related data</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteScholarship}
              disabled={deleteScholarshipMutation.isPending}
            >
              {deleteScholarshipMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Scholarship'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}