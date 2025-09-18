import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PatternWrapper } from '@/components/au-showcase'
import { Button } from '@/components/ui/button'
import { useDemographicsData } from '@/hooks/use-dashboard-stats'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  Users,
  PieChart,
  BarChart3,
  TrendingUp,
  MapPin,
  GraduationCap,
  Download,
  Filter,
  Globe
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DemographicData {
  category: string
  subcategory: string
  count: number
  percentage: number
  trend: number
}

const mockDemographics: DemographicData[] = [
  // Gender
  { category: 'Gender', subcategory: 'Female', count: 960, percentage: 52, trend: 3.2 },
  { category: 'Gender', subcategory: 'Male', count: 887, percentage: 48, trend: -1.5 },

  // Academic Level
  { category: 'Academic Level', subcategory: 'Undergraduate', count: 1256, percentage: 68, trend: 2.1 },
  { category: 'Academic Level', subcategory: 'Masters', count: 443, percentage: 24, trend: 4.5 },
  { category: 'Academic Level', subcategory: 'PhD', count: 148, percentage: 8, trend: 1.8 },

  // Nationality (Top 10)
  { category: 'Nationality', subcategory: 'Zimbabwe', count: 554, percentage: 30, trend: 0.5 },
  { category: 'Nationality', subcategory: 'Kenya', count: 369, percentage: 20, trend: 2.3 },
  { category: 'Nationality', subcategory: 'Uganda', count: 277, percentage: 15, trend: 1.8 },
  { category: 'Nationality', subcategory: 'Tanzania', count: 185, percentage: 10, trend: 3.1 },
  { category: 'Nationality', subcategory: 'Zambia', count: 147, percentage: 8, trend: -0.5 },
  { category: 'Nationality', subcategory: 'Malawi', count: 111, percentage: 6, trend: 1.2 },
  { category: 'Nationality', subcategory: 'Rwanda', count: 92, percentage: 5, trend: 4.2 },
  { category: 'Nationality', subcategory: 'South Africa', count: 74, percentage: 4, trend: 0.8 },
  { category: 'Nationality', subcategory: 'Botswana', count: 28, percentage: 1.5, trend: -1.1 },
  { category: 'Nationality', subcategory: 'Other', count: 10, percentage: 0.5, trend: -2.0 },

  // Program
  { category: 'Program', subcategory: 'Engineering', count: 517, percentage: 28, trend: 2.8 },
  { category: 'Program', subcategory: 'Business', count: 406, percentage: 22, trend: 1.5 },
  { category: 'Program', subcategory: 'Medicine', count: 332, percentage: 18, trend: 3.2 },
  { category: 'Program', subcategory: 'Education', count: 221, percentage: 12, trend: 0.8 },
  { category: 'Program', subcategory: 'Agriculture', count: 185, percentage: 10, trend: 2.1 },
  { category: 'Program', subcategory: 'Law', count: 111, percentage: 6, trend: 1.2 },
  { category: 'Program', subcategory: 'Theology', count: 75, percentage: 4, trend: -0.5 },

  // Age Groups
  { category: 'Age Group', subcategory: '18-22', count: 1109, percentage: 60, trend: 1.8 },
  { category: 'Age Group', subcategory: '23-27', count: 554, percentage: 30, trend: 2.5 },
  { category: 'Age Group', subcategory: '28-32', count: 147, percentage: 8, trend: 1.2 },
  { category: 'Age Group', subcategory: '33+', count: 37, percentage: 2, trend: 0.5 },
]

export default function Demographics() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Gender')
  const [selectedYear, setSelectedYear] = useState<string>('2025')

  const { data: demographicsData, isLoading, error } = useDemographicsData()

  // Transform API data to match the component structure
  const processedData: DemographicData[] = []

  if (demographicsData) {
    // Gender data
    const totalBeneficiaries = demographicsData.totalBeneficiaries
    processedData.push(
      {
        category: 'Gender',
        subcategory: 'Female',
        count: Math.round((totalBeneficiaries * demographicsData.genderDistribution.female) / 100),
        percentage: demographicsData.genderDistribution.female,
        trend: 3.2
      },
      {
        category: 'Gender',
        subcategory: 'Male',
        count: Math.round((totalBeneficiaries * demographicsData.genderDistribution.male) / 100),
        percentage: demographicsData.genderDistribution.male,
        trend: -1.5
      }
    )

    // Academic Level data
    processedData.push(
      {
        category: 'Academic Level',
        subcategory: 'Undergraduate',
        count: Math.round((totalBeneficiaries * demographicsData.academicLevels.undergraduate) / 100),
        percentage: demographicsData.academicLevels.undergraduate,
        trend: 2.1
      },
      {
        category: 'Academic Level',
        subcategory: 'Masters',
        count: Math.round((totalBeneficiaries * demographicsData.academicLevels.masters) / 100),
        percentage: demographicsData.academicLevels.masters,
        trend: 4.5
      },
      {
        category: 'Academic Level',
        subcategory: 'PhD',
        count: Math.round((totalBeneficiaries * demographicsData.academicLevels.phd) / 100),
        percentage: demographicsData.academicLevels.phd,
        trend: 1.8
      }
    )

    // Program data from API
    demographicsData.topPrograms.forEach(program => {
      processedData.push({
        category: 'Program',
        subcategory: program.name,
        count: Math.round((totalBeneficiaries * program.percentage) / 100),
        percentage: program.percentage,
        trend: Math.random() * 5 - 1 // Random trend for now
      })
    })
  }

  const filteredData = processedData.filter(item => item.category === selectedCategory)
  const categories = [...new Set(processedData.map(item => item.category))]

  const getTrendColor = (trend: number) => {
    if (trend > 2) return 'text-green-600'
    if (trend > 0) return 'text-green-500'
    if (trend < -1) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-3 h-3" />
    return <TrendingUp className="w-3 h-3 transform rotate-180" />
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
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Demographics Analysis</h1>
                  <p className="text-gray-600">Detailed breakdown of scholarship beneficiaries by various categories</p>
                </div>
                <Button className="au-btn-secondary flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Demographics Report
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="au-stat-section au-section-gray-textured">
            <div className="container mx-auto">
              {error ? (
                <div className="au-stat-grid">
                  <div className="col-span-4 p-8 text-center">
                    <p className="text-red-600 mb-2">Error loading demographics data</p>
                    <p className="text-gray-500 text-sm">Please try refreshing the page</p>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="au-stat-grid">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="au-stat-item">
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="au-stat-grid">
                  <div className="au-stat-item">
                    <span className="au-stat-number">{demographicsData?.totalBeneficiaries?.toLocaleString() || 0}</span>
                    <span className="au-stat-label">Total Beneficiaries</span>
                  </div>
                  <div className="au-stat-item">
                    <span className="au-stat-number">{demographicsData?.genderDistribution?.female || 0}%</span>
                    <span className="au-stat-label">Female Recipients</span>
                  </div>
                  <div className="au-stat-item">
                    <span className="au-stat-number">15</span>
                    <span className="au-stat-label">Countries Represented</span>
                  </div>
                  <div className="au-stat-item">
                    <span className="au-stat-number">{demographicsData?.topPrograms?.length || 0}</span>
                    <span className="au-stat-label">Academic Programs</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="container mx-auto px-8 py-6">
            <PatternWrapper pattern="dots" className="au-card">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">Category:</span>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">Year:</span>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PatternWrapper>
          </div>

          {/* Visualization Grid */}
          <div className="container mx-auto px-8 pb-8">
            <div className="au-grid au-grid-2 mb-8">
              {/* Chart Visualization */}
              <PatternWrapper pattern="geometric" className="au-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{selectedCategory} Distribution</h3>
                    <PieChart className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="space-y-4">
                    {filteredData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{item.subcategory}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{item.count} ({item.percentage}%)</span>
                            <span className={`flex items-center text-xs ${getTrendColor(item.trend)}`}>
                              {getTrendIcon(item.trend)}
                              {Math.abs(item.trend).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              index % 4 === 0 ? 'bg-blue-500' :
                              index % 4 === 1 ? 'bg-green-500' :
                              index % 4 === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PatternWrapper>

              {/* Key Insights */}
              <PatternWrapper pattern="grid" className="au-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Key Insights</h3>
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="space-y-4">
                    {selectedCategory === 'Gender' && (
                      <>
                        <div className="flex items-start gap-3">
                          <Users className="w-4 h-4 text-pink-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Gender Balance Achievement</p>
                            <p className="text-xs text-gray-600">52% female representation exceeds 50% target</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Positive Growth Trend</p>
                            <p className="text-xs text-gray-600">Female participation increased by 3.2% this year</p>
                          </div>
                        </div>
                      </>
                    )}
                    {selectedCategory === 'Nationality' && (
                      <>
                        <div className="flex items-start gap-3">
                          <Globe className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Regional Diversity</p>
                            <p className="text-xs text-gray-600">Students from 15 African countries represented</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Local Impact</p>
                            <p className="text-xs text-gray-600">30% of scholarships support Zimbabwean students</p>
                          </div>
                        </div>
                      </>
                    )}
                    {selectedCategory === 'Academic Level' && (
                      <>
                        <div className="flex items-start gap-3">
                          <GraduationCap className="w-4 h-4 text-purple-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Undergraduate Focus</p>
                            <p className="text-xs text-gray-600">68% support undergraduate education</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Graduate Growth</p>
                            <p className="text-xs text-gray-600">Masters programs showing 4.5% increase</p>
                          </div>
                        </div>
                      </>
                    )}
                    {selectedCategory === 'Program' && (
                      <>
                        <div className="flex items-start gap-3">
                          <BarChart3 className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">STEM Dominance</p>
                            <p className="text-xs text-gray-600">Engineering and Medicine account for 46% of scholarships</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Healthcare Growth</p>
                            <p className="text-xs text-gray-600">Medicine programs growing fastest at 3.2%</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </PatternWrapper>
            </div>

            {/* Detailed Table */}
            <PatternWrapper pattern="dots" className="au-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{selectedCategory} Breakdown ({selectedYear})</h3>
                  <div className="text-sm text-gray-600">
                    Total: {filteredData.reduce((sum, item) => sum + item.count, 0)} students
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{selectedCategory}</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>YoY Trend</TableHead>
                        <TableHead>Visual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.subcategory}</TableCell>
                          <TableCell>{item.count.toLocaleString()}</TableCell>
                          <TableCell>{item.percentage}%</TableCell>
                          <TableCell>
                            <span className={`flex items-center ${getTrendColor(item.trend)}`}>
                              {getTrendIcon(item.trend)}
                              <span className="ml-1">{item.trend > 0 ? '+' : ''}{item.trend.toFixed(1)}%</span>
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  index % 4 === 0 ? 'bg-blue-500' :
                                  index % 4 === 1 ? 'bg-green-500' :
                                  index % 4 === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                                }`}
                                style={{ width: `${(item.percentage / Math.max(...filteredData.map(d => d.percentage))) * 100}%` }}
                              />
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