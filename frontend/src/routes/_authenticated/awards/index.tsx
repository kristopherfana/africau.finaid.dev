import { createFileRoute } from '@tanstack/react-router'
import { StudentHeader } from '@/components/layout/student-header'
import { Main } from '@/components/layout/main'
import { PatternWrapper } from '@/components/au-showcase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Award, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  GraduationCap,
  FileText,
  Download,
  Star,
  Trophy,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/awards/')({
  component: AwardsPage,
})

function AwardsPage() {
  const [awardedScholarships] = useState([
    {
      id: 1,
      title: 'Academic Merit Award',
      amount: 25000,
      status: 'active',
      awardDate: '2024-03-15',
      validUntil: '2025-12-31',
      disbursementSchedule: 'Semester-based',
      nextDisbursement: '2025-09-01',
      totalReceived: 12500,
      category: 'MERIT',
      sponsor: 'Africa University Foundation',
      gpa: 3.8,
      requirements: [
        'Maintain GPA above 3.5',
        'Complete 15 credit hours per semester',
        'Submit progress reports'
      ],
      renewalStatus: 'eligible',
    },
    {
      id: 2,
      title: 'Engineering Excellence Grant',
      amount: 15000,
      status: 'completed',
      awardDate: '2023-08-20',
      validUntil: '2024-12-31',
      disbursementSchedule: 'Annual',
      totalReceived: 15000,
      category: 'RESEARCH',
      sponsor: 'Tech Innovation Partners',
      requirements: [
        'Research project completion',
        'Conference presentation'
      ],
      renewalStatus: 'completed',
    }
  ])

  const totalAwardValue = awardedScholarships.reduce((sum, scholarship) => sum + scholarship.amount, 0)
  const totalReceived = awardedScholarships.reduce((sum, scholarship) => sum + scholarship.totalReceived, 0)

  return (
    <>
      <StudentHeader />
      <Main className="p-0">
        <div className="au-showcase">
          {/* Page Header */}
          <div className="au-hero-section">
            <div className="container mx-auto px-8">
              <div className="flex items-center space-x-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <h1 className="text-3xl font-bold text-gray-800">Awarded Scholarships</h1>
              </div>
              <p className="text-gray-600">Track your scholarship awards and manage renewal requirements</p>
            </div>
          </div>

          {/* Awards Summary Stats */}
          <div className="au-section-gray-textured py-8">
            <div className="container mx-auto px-8">
              <div className="au-grid au-grid-4">
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Total Awards</h3>
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{awardedScholarships.length}</div>
                    <p className="text-xs text-gray-500 mt-1">Active & Completed</p>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="geometric" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Total Value</h3>
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">${totalAwardValue.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">Lifetime awards</p>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="grid" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Received</h3>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">${totalReceived.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((totalReceived / totalAwardValue) * 100)}% of total
                    </p>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Active Awards</h3>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {awardedScholarships.filter(s => s.status === 'active').length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Currently receiving</p>
                  </div>
                </PatternWrapper>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-8 py-12">
            {awardedScholarships.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">No Awards Yet</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  You haven't received any scholarship awards yet. Keep applying to increase your chances!
                </p>
                <Link to="/scholarships">
                  <button className="au-btn-primary px-8 py-3 rounded-md font-semibold transition-all duration-200">
                    Browse Scholarships
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {awardedScholarships.map((scholarship) => (
                  <div key={scholarship.id} className="au-card hover:shadow-lg transition-shadow">
                    <div className="p-8">
                      {/* Scholarship Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{scholarship.title}</h3>
                            <p className="text-gray-600">{scholarship.sponsor}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {scholarship.status === 'active' && (
                            <span className="au-badge au-badge-success">Active</span>
                          )}
                          {scholarship.status === 'completed' && (
                            <span className="au-badge au-badge-neutral">Completed</span>
                          )}
                          {scholarship.renewalStatus === 'eligible' && (
                            <span className="au-badge au-badge-info">Renewal Eligible</span>
                          )}
                        </div>
                      </div>

                      {/* Scholarship Details Grid */}
                      <div className="au-grid au-grid-3 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Award Amount:</span>
                            <span className="font-bold text-green-600">${scholarship.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Received:</span>
                            <span className="font-bold text-blue-600">${scholarship.totalReceived.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Target className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Category:</span>
                            <span className="text-gray-700">{scholarship.category}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Awarded:</span>
                            <span className="text-gray-700">{new Date(scholarship.awardDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Valid Until:</span>
                            <span className="text-gray-700">{new Date(scholarship.validUntil).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Schedule:</span>
                            <span className="text-gray-700">{scholarship.disbursementSchedule}</span>
                          </div>
                        </div>

                        {scholarship.gpa && (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm">
                              <Star className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">Current GPA:</span>
                              <span className="font-bold text-yellow-600">{scholarship.gpa}</span>
                            </div>
                            {scholarship.nextDisbursement && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Next Payment:</span>
                                <span className="text-gray-700">{new Date(scholarship.nextDisbursement).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Requirements Section */}
                      {scholarship.requirements && scholarship.requirements.length > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start space-x-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <h4 className="font-semibold text-yellow-800">Renewal Requirements</h4>
                          </div>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            {scholarship.requirements.map((req, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-yellow-600" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button className="au-btn-secondary px-4 py-2 text-sm rounded-md font-semibold transition-all duration-200 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          View Award Letter
                        </button>
                        <button className="py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center text-sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Documents
                        </button>
                        {scholarship.status === 'active' && scholarship.renewalStatus === 'eligible' && (
                          <button className="au-btn-primary px-4 py-2 text-sm rounded-md font-semibold transition-all duration-200 flex items-center">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Apply for Renewal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Renewal Reminder Card */}
                {awardedScholarships.some(s => s.renewalStatus === 'eligible') && (
                  <div className="au-card bg-blue-50 border-blue-200 mt-8">
                    <div className="p-6">
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-2">Renewal Reminder</h3>
                          <p className="text-sm text-blue-800 mb-4">
                            You have scholarships eligible for renewal. Make sure to submit your renewal applications 
                            and maintain all requirements to continue receiving funding.
                          </p>
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View Renewal Guidelines →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Main>
    </>
  )
}