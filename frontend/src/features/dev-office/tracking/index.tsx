import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
import { useDashboardStats, useDemographicsData } from '@/hooks/use-dashboard-stats'
import { useScholarships } from '@/hooks/use-scholarships'
import { scholarshipsAPI } from '@/lib/api'
import { Scholarship } from '@/types/scholarship'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Award,
  BarChart3,
  Download,
  Filter,
  AlertCircle
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function CycleTracking() {
  const [selectedScholarship, setSelectedScholarship] = useState<string>('')
  const [selectedCycles, setSelectedCycles] = useState<string[]>([])
  const [cycles, setCycles] = useState<Scholarship[]>([])
  const [allCycles, setAllCycles] = useState<Scholarship[]>([])
  const [cyclesLoading, setCyclesLoading] = useState(false)
  const [cyclesError, setCyclesError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'single' | 'multi' | 'all'>('single')

  const { data: dashboardStats, isLoading: dashboardLoading, error: dashboardError } = useDashboardStats()
  const { data: demographicsData, isLoading: demographicsLoading, error: demographicsError } = useDemographicsData()
  const { data: scholarshipsData } = useScholarships()

  // Fetch all cycles on component mount
  useEffect(() => {
    const fetchAllCycles = async () => {
      try {
        setCyclesLoading(true)
        setCyclesError(null)
        const response = await scholarshipsAPI.getAllCycles({ limit: 100 })
        setAllCycles(response.data)
      } catch (err) {
        setCyclesError(err instanceof Error ? err.message : 'Failed to fetch all cycles')
      } finally {
        setCyclesLoading(false)
      }
    }

    fetchAllCycles()
  }, [])

  // Fetch cycles when scholarship is selected
  useEffect(() => {
    const fetchCycles = async () => {
      if (!selectedScholarship) {
        setCycles([])
        setSelectedCycles([])
        return
      }

      try {
        setCyclesLoading(true)
        setCyclesError(null)
        const cycleData = await scholarshipsAPI.getCyclesByProgram(selectedScholarship)
        setCycles(cycleData)

        // Auto-select first cycle for single mode, or first two for multi mode
        if (cycleData.length > 0) {
          if (viewMode === 'single') {
            setSelectedCycles([cycleData[0].id])
          } else if (viewMode === 'multi' && cycleData.length > 1) {
            setSelectedCycles([cycleData[0].id, cycleData[1].id])
          }
        }
      } catch (err) {
        setCyclesError(err instanceof Error ? err.message : 'Failed to fetch cycles')
      } finally {
        setCyclesLoading(false)
      }
    }

    fetchCycles()
  }, [selectedScholarship, viewMode])

  // Get selected cycle data
  const selectedCycleData = selectedCycles.map(id =>
    (selectedScholarship ? cycles : allCycles).find(c => c.id === id)
  ).filter(Boolean) as Scholarship[]

  // Determine which cycles to display
  const displayCycles = viewMode === 'all' ? allCycles :
                       selectedScholarship ? cycles : allCycles

  // Helper functions for multi-cycle analysis
  const calculateEvolutionTrend = (cycles: Scholarship[], metric: keyof Scholarship) => {
    if (cycles.length < 2) return 0
    const values = cycles.map(c => Number(c[metric])).filter(v => !isNaN(v))
    if (values.length < 2) return 0

    // Calculate average change between consecutive cycles
    let totalChange = 0
    for (let i = 1; i < values.length; i++) {
      totalChange += ((values[i] - values[i-1]) / values[i-1]) * 100
    }
    return totalChange / (values.length - 1)
  }

  const getMetricStats = (cycles: Scholarship[], metric: keyof Scholarship) => {
    const values = cycles.map(c => Number(c[metric])).filter(v => !isNaN(v))
    if (values.length === 0) return { min: 0, max: 0, avg: 0, total: 0 }

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      total: values.reduce((a, b) => a + b, 0)
    }
  }

  const isLoading = dashboardLoading || demographicsLoading || cyclesLoading
  const hasError = dashboardError || demographicsError || cyclesError

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
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Cycle Tracking</h1>
                  <p className="text-gray-600">
                    Compare scholarship cycles and track performance across different application periods
                    {selectedScholarship && scholarshipsData?.data && (
                      <span className="block text-sm mt-1 text-blue-600 font-medium">
                        Analyzing: {scholarshipsData.data.find(s => s.id === selectedScholarship)?.name}
                      </span>
                    )}
                  </p>
                </div>
                <Button className="au-btn-secondary flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>

          {/* View Mode and Selection Controls */}
          <div className="container mx-auto px-8 py-6">
            <PatternWrapper pattern="dots" className="au-card">
              <div className="p-6 space-y-4">
                {/* View Mode Selection */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">View Mode:</span>
                    <Select value={viewMode} onValueChange={(value: 'single' | 'multi' | 'all') => {
                      setViewMode(value)
                      setSelectedCycles([])
                      if (value === 'all') {
                        setSelectedScholarship('')
                      }
                    }}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Cycle</SelectItem>
                        <SelectItem value="multi">Multi-Cycle Evolution</SelectItem>
                        <SelectItem value="all">All Cycles Overview</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Scholarship Selection (hidden in 'all' mode) */}
                {viewMode !== 'all' && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold">Scholarship Program:</span>
                      <Select value={selectedScholarship} onValueChange={setSelectedScholarship}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select a scholarship" />
                        </SelectTrigger>
                        <SelectContent>
                          {scholarshipsData?.data?.map((scholarship) => (
                            <SelectItem key={scholarship.id} value={scholarship.id}>
                              {scholarship.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Cycle Selection */}
                {selectedScholarship && cycles.length > 0 && viewMode !== 'all' && (
                  <div className="space-y-4">
                    {viewMode === 'single' ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold">Select Cycle:</span>
                        <Select
                          value={selectedCycles[0] || ''}
                          onValueChange={(value) => setSelectedCycles([value])}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select cycle" />
                          </SelectTrigger>
                          <SelectContent>
                            {cycles.map(cycle => (
                              <SelectItem key={cycle.id} value={cycle.id}>
                                {cycle.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Filter className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold">Select Cycles for Evolution Analysis:</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {cycles.map(cycle => (
                            <div key={cycle.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={cycle.id}
                                checked={selectedCycles.includes(cycle.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCycles([...selectedCycles, cycle.id])
                                  } else {
                                    setSelectedCycles(selectedCycles.filter(id => id !== cycle.id))
                                  }
                                }}
                              />
                              <Label
                                htmlFor={cycle.id}
                                className="text-sm cursor-pointer truncate max-w-[150px]"
                                title={cycle.name}
                              >
                                {cycle.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PatternWrapper>
          </div>

          {/* Key Metrics */}
          <div className="container mx-auto px-8 pb-6">
            {hasError ? (
              <div className="au-grid au-grid-1">
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 mb-2">Error loading tracking data</p>
                    <p className="text-gray-500 text-sm">{cyclesError || 'Please try refreshing the page'}</p>
                  </div>
                </PatternWrapper>
              </div>
            ) : isLoading ? (
              <div className="au-grid au-grid-4">
                {[1, 2, 3, 4].map((i) => (
                  <PatternWrapper key={i} pattern="dots" className="au-card">
                    <div className="p-6">
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </PatternWrapper>
                ))}
              </div>
            ) : viewMode === 'all' ? (
              // All Cycles Overview
              <div className="au-grid au-grid-4">
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold">{allCycles.length}</div>
                    <div className="text-sm text-gray-600">Total Cycles</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Across all programs
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="geometric" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">{getMetricStats(allCycles, 'currentApplications').total}</div>
                    <div className="text-sm text-gray-600">Total Applications</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Avg: {Math.round(getMetricStats(allCycles, 'currentApplications').avg)} per cycle
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="grid" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold">${(getMetricStats(allCycles, 'amount').total / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-gray-600">Total Award Value</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Avg: ${Math.round(getMetricStats(allCycles, 'amount').avg).toLocaleString()}
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold">{allCycles.filter(c => c.status === 'OPEN').length}</div>
                    <div className="text-sm text-gray-600">Active Cycles</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {allCycles.filter(c => c.status === 'DRAFT').length} in draft
                    </div>
                  </div>
                </PatternWrapper>
              </div>
            ) : viewMode === 'multi' && selectedCycleData.length > 0 ? (
              // Multi-Cycle Evolution Analysis
              <div className="au-grid au-grid-4">
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-6 h-6 text-blue-600" />
                      <TrendingUp className={`w-4 h-4 ${calculateEvolutionTrend(selectedCycleData, 'maxRecipients') >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="text-2xl font-bold">{getMetricStats(selectedCycleData, 'maxRecipients').avg.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Avg Recipients</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Trend: {calculateEvolutionTrend(selectedCycleData, 'maxRecipients').toFixed(1)}%
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="geometric" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-6 h-6 text-green-600" />
                      <TrendingUp className={`w-4 h-4 ${calculateEvolutionTrend(selectedCycleData, 'currentApplications') >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="text-2xl font-bold">{getMetricStats(selectedCycleData, 'currentApplications').total}</div>
                    <div className="text-sm text-gray-600">Total Applications</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Trend: {calculateEvolutionTrend(selectedCycleData, 'currentApplications').toFixed(1)}%
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="grid" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                      <TrendingUp className={`w-4 h-4 ${calculateEvolutionTrend(selectedCycleData, 'amount') >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="text-2xl font-bold">${getMetricStats(selectedCycleData, 'amount').avg.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Avg Award Amount</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Trend: {calculateEvolutionTrend(selectedCycleData, 'amount').toFixed(1)}%
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold">{selectedCycleData.length}</div>
                    <div className="text-sm text-gray-600">Selected Cycles</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Evolution analysis
                    </div>
                  </div>
                </PatternWrapper>
              </div>
            ) : selectedCycleData.length === 1 ? (
              // Single Cycle View
              <div className="au-grid au-grid-4">
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold">{selectedCycleData[0].maxRecipients}</div>
                    <div className="text-sm text-gray-600">Max Recipients</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedCycleData[0].name}
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="geometric" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">{selectedCycleData[0].currentApplications}</div>
                    <div className="text-sm text-gray-600">Current Applications</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedCycleData[0].maxRecipients - selectedCycleData[0].currentApplications} slots remaining
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="grid" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold">${selectedCycleData[0].amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Award Amount</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Per recipient
                    </div>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold">{selectedCycleData[0].status}</div>
                    <div className="text-sm text-gray-600">Cycle Status</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Current status
                    </div>
                  </div>
                </PatternWrapper>
              </div>
            ) : (
              <div className="au-grid au-grid-1">
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-8 text-center">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      {viewMode === 'single' ? 'Select a Cycle' :
                       viewMode === 'multi' ? 'Select Cycles for Analysis' :
                       'Select View Mode'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {viewMode === 'single' ? 'Choose a scholarship program and cycle to view details' :
                       viewMode === 'multi' ? 'Choose a scholarship program and select multiple cycles to analyze evolution' :
                       'Choose how you want to view and analyze scholarship cycles'}
                    </p>
                  </div>
                </PatternWrapper>
              </div>
            )}
          </div>

          {/* Detailed Comparison Table */}
          {(displayCycles.length > 0) && (
            <div className="container mx-auto px-8 pb-8">
              <PatternWrapper pattern="geometric" className="au-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {viewMode === 'all' ? 'All Cycles Overview' :
                       viewMode === 'multi' ? 'Evolution Analysis Table' :
                       'Cycle Details'}
                    </h3>
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cycle</TableHead>
                          {viewMode === 'all' && <TableHead>Program</TableHead>}
                          <TableHead>Academic Year</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Max Recipients</TableHead>
                          <TableHead>Current Applications</TableHead>
                          <TableHead>Award Amount</TableHead>
                          <TableHead>Application Period</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayCycles.map((cycle) => (
                          <TableRow
                            key={cycle.id}
                            className={
                              selectedCycles.includes(cycle.id) ? 'bg-blue-50' : ''
                            }
                          >
                            <TableCell className="font-medium">
                              <div className="max-w-[200px] truncate" title={cycle.name}>
                                {cycle.name}
                              </div>
                              {selectedCycles.includes(cycle.id) && viewMode !== 'all' && (
                                <span className="ml-2 text-xs au-badge au-badge-primary">Selected</span>
                              )}
                            </TableCell>
                            {viewMode === 'all' && (
                              <TableCell>
                                <div className="max-w-[150px] truncate" title={cycle.sponsor}>
                                  {cycle.sponsor}
                                </div>
                              </TableCell>
                            )}
                            <TableCell>
                              {new Date(cycle.applicationStartDate).getFullYear()}-{new Date(cycle.applicationDeadline).getFullYear()}
                            </TableCell>
                            <TableCell>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                cycle.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                cycle.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                cycle.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {cycle.status}
                              </span>
                            </TableCell>
                            <TableCell>{cycle.maxRecipients}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{cycle.currentApplications}</span>
                                {viewMode === 'multi' && selectedCycles.includes(cycle.id) && (
                                  <span className="text-xs text-gray-500">
                                    {((cycle.currentApplications / cycle.maxRecipients) * 100).toFixed(1)}% filled
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>${cycle.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {new Date(cycle.applicationStartDate).toLocaleDateString()} -
                                <br />
                                {new Date(cycle.applicationDeadline).toLocaleDateString()}
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
          )}

          {/* Evolution Analysis Section */}
          {viewMode === 'multi' && selectedCycleData.length > 1 && (
            <div className="container mx-auto px-8 pb-8">
              <div className="au-section-header mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Evolution Analysis
                  {selectedScholarship && scholarshipsData?.data && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      - {scholarshipsData.data.find(s => s.id === selectedScholarship)?.name}
                    </span>
                  )}
                </h2>
                <p className="text-gray-600 mt-2">
                  Analyzing {selectedCycleData.length} selected cycles to identify trends and patterns
                </p>
              </div>

              <div className="au-grid au-grid-2 mb-8">
                {/* Evolution Trends */}
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                      Growth Trends
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Applications Trend</span>
                          <span className={`text-sm font-bold ${calculateEvolutionTrend(selectedCycleData, 'currentApplications') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculateEvolutionTrend(selectedCycleData, 'currentApplications').toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${calculateEvolutionTrend(selectedCycleData, 'currentApplications') >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(Math.abs(calculateEvolutionTrend(selectedCycleData, 'currentApplications')), 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Award Amount Trend</span>
                          <span className={`text-sm font-bold ${calculateEvolutionTrend(selectedCycleData, 'amount') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculateEvolutionTrend(selectedCycleData, 'amount').toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${calculateEvolutionTrend(selectedCycleData, 'amount') >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(Math.abs(calculateEvolutionTrend(selectedCycleData, 'amount')), 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Capacity Trend</span>
                          <span className={`text-sm font-bold ${calculateEvolutionTrend(selectedCycleData, 'maxRecipients') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculateEvolutionTrend(selectedCycleData, 'maxRecipients').toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${calculateEvolutionTrend(selectedCycleData, 'maxRecipients') >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(Math.abs(calculateEvolutionTrend(selectedCycleData, 'maxRecipients')), 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </PatternWrapper>

                {/* Key Statistics */}
                <PatternWrapper pattern="geometric" className="au-card">
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                      Key Statistics
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Total Applications</p>
                          <p className="text-lg font-bold">{getMetricStats(selectedCycleData, 'currentApplications').total}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg per Cycle</p>
                          <p className="text-lg font-bold">{Math.round(getMetricStats(selectedCycleData, 'currentApplications').avg)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Total Funding</p>
                          <p className="text-lg font-bold">${(getMetricStats(selectedCycleData, 'amount').total / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg Award</p>
                          <p className="text-lg font-bold">${Math.round(getMetricStats(selectedCycleData, 'amount').avg).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Max Capacity</p>
                          <p className="text-lg font-bold">{getMetricStats(selectedCycleData, 'maxRecipients').max}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Min Capacity</p>
                          <p className="text-lg font-bold">{getMetricStats(selectedCycleData, 'maxRecipients').min}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </PatternWrapper>
              </div>

              {/* Cycle Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCycleData.map((cycle, index) => (
                  <Card key={cycle.id} className="relative">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium truncate" title={cycle.name}>
                        {cycle.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Cycle {index + 1} of {selectedCycleData.length}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Applications</p>
                          <p className="font-semibold">{cycle.currentApplications}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="font-semibold">{cycle.maxRecipients}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Award</p>
                          <p className="font-semibold">${cycle.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            cycle.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                            cycle.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                            cycle.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {cycle.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Fill Rate</span>
                          <span className="text-xs font-medium">
                            {((cycle.currentApplications / cycle.maxRecipients) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min((cycle.currentApplications / cycle.maxRecipients) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Single Cycle Detailed Analysis */}
          {viewMode === 'single' && selectedCycleData.length === 1 && (
            <div className="container mx-auto px-8 pb-8">
              <div className="au-section-header mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedCycleData[0].name} Details
                  {selectedScholarship && scholarshipsData?.data && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      - {scholarshipsData.data.find(s => s.id === selectedScholarship)?.name}
                    </span>
                  )}
                </h2>
              </div>
              <div className="au-grid au-grid-3">
                {/* Cycle Information */}
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-4">Cycle Information</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Application Period</span>
                        </div>
                        <p className="text-sm font-bold">
                          {new Date(selectedCycleData[0].applicationStartDate).toLocaleDateString()} - {new Date(selectedCycleData[0].applicationDeadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Status</span>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          selectedCycleData[0].status === 'OPEN' ? 'bg-green-100 text-green-800' :
                          selectedCycleData[0].status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                          selectedCycleData[0].status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedCycleData[0].status}
                        </span>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Award Amount</span>
                        </div>
                        <p className="text-sm font-bold">
                          ${selectedCycleData[0].amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </PatternWrapper>

                {/* Application Statistics */}
                <PatternWrapper pattern="geometric" className="au-card">
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-4">Application Statistics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Current Applications</span>
                          <span className="text-sm font-bold">
                            {selectedCycleData[0].currentApplications}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: `${Math.min((selectedCycleData[0].currentApplications / selectedCycleData[0].maxRecipients) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Max Recipients</span>
                          <span className="text-sm font-bold">
                            {selectedCycleData[0].maxRecipients}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {selectedCycleData[0].maxRecipients - selectedCycleData[0].currentApplications} slots remaining
                        </p>
                      </div>
                    </div>
                  </div>
                </PatternWrapper>

                {/* Program Context */}
                <PatternWrapper pattern="grid" className="au-card">
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-4">Program Context</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Sponsor</p>
                        <p className="text-xs text-gray-600">{selectedCycleData[0].sponsor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Scholarship Type</p>
                        <p className="text-xs text-gray-600">{selectedCycleData[0].type}</p>
                      </div>
                      {selectedCycleData[0].eligibilityCriteria && selectedCycleData[0].eligibilityCriteria.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Eligibility Criteria</p>
                          <ul className="text-xs text-gray-600 mt-1">
                            {selectedCycleData[0].eligibilityCriteria.slice(0, 3).map((criteria, index) => (
                              <li key={index} className="truncate">• {criteria}</li>
                            ))}
                            {selectedCycleData[0].eligibilityCriteria.length > 3 && (
                              <li className="text-gray-500">• +{selectedCycleData[0].eligibilityCriteria.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </PatternWrapper>
              </div>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}