import { useState, useEffect } from 'react'
import { useAuth } from '@/stores/authStore'
import { usersAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { UserResponseDto, UserRole } from '@/types/user'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  Award,
  Edit,
  Shield,
  Eye,
  Building2,
  Star,
  Clock,
  DollarSign,
  Users,
  School,
  Briefcase,
} from 'lucide-react'
import { toast } from 'sonner'

interface AUProfileOverviewProps {
  onEditClick: () => void
}

export function AUProfileOverview({ onEditClick }: AUProfileOverviewProps) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const profileData = await usersAPI.getProfile()
          setProfile(profileData)
        } catch (error) {
          console.error('Failed to load profile:', error)
          toast.error('Failed to load profile data')
        } finally {
          setIsLoading(false)
        }
      }
    }
    loadProfile()
  }, [user?.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-md w-1/3" />
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-48 bg-gray-200 rounded-lg" />
              <div className="h-48 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="container mx-auto px-6 py-8">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-8 text-center">
              <School className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
              <p className="text-gray-600">No profile data available at this time.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const userDisplayName = `${profile.firstName} ${profile.lastName}`
  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      'STUDENT': 'Student',
      'ADMIN': 'Administrator', 
      'SPONSOR': 'Sponsor',
      'REVIEWER': 'Application Reviewer'
    }
    return roleMap[role as keyof typeof roleMap] || role
  }

  const getRoleColor = (role: string) => {
    const colorMap = {
      'STUDENT': 'bg-blue-500',
      'ADMIN': 'bg-red-500',
      'SPONSOR': 'bg-green-500', 
      'REVIEWER': 'bg-purple-500'
    }
    return colorMap[role as keyof typeof colorMap] || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Africa University</h1>
              <p className="text-blue-100">Student Information System</p>
            </div>
            <div className="text-right">
              <div className="text-blue-100 text-sm">Academic Year</div>
              <div className="font-semibold">2024-2025</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8 border-l-4 border-l-amber-500 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{userDisplayName}</h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge 
                    className={`${getRoleColor(profile.role)} text-white px-3 py-1`}
                  >
                    {getRoleDisplayName(profile.role)}
                  </Badge>
                  
                  {/* Role-specific badges */}
                  {profile.role === UserRole.STUDENT && profile.studentProfile && (
                    <>
                      <Badge variant="outline" className="border-blue-500 text-blue-700">
                        ID: {profile.studentProfile.studentId}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500 text-blue-700 capitalize">
                        {profile.studentProfile.level.toLowerCase()}
                      </Badge>
                    </>
                  )}
                  
                  {profile.role === UserRole.REVIEWER && profile.reviewerProfile && (
                    <Badge variant="outline" className="border-purple-500 text-purple-700">
                      {profile.reviewerProfile.reviewQuota || 10} reviews/month
                    </Badge>
                  )}
                  
                  {profile.role === UserRole.ADMIN && profile.adminProfile && (
                    <Badge variant="outline" className="border-red-500 text-red-700 capitalize">
                      {profile.adminProfile.accessLevel?.toLowerCase() || 'standard'} Access
                    </Badge>
                  )}
                  
                  {profile.role === UserRole.SPONSOR && profile.sponsorProfile && (
                    <Badge variant="outline" className="border-green-500 text-green-700 capitalize">
                      {profile.sponsorProfile.sponsorType?.toLowerCase()} Sponsor
                    </Badge>
                  )}
                  
                  <Badge variant={profile.isActive ? "default" : "destructive"}>
                    {profile.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Edit Button */}
              <Button 
                onClick={onEditClick} 
                className="bg-amber-500 hover:bg-amber-600 text-white"
                size="lg"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Personal Information */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {profile.phoneNumber && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </div>
                    <span className="font-medium">{profile.phoneNumber}</span>
                  </div>
                )}
                {profile.dateOfBirth && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Date of Birth</span>
                    </div>
                    <span className="font-medium">
                      {new Date(profile.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {profile.gender && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Gender</span>
                    </div>
                    <span className="font-medium capitalize">{profile.gender.toLowerCase()}</span>
                  </div>
                )}
                {profile.nationality && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Nationality</span>
                    </div>
                    <span className="font-medium">{profile.nationality}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role-Specific Information */}
          {profile.role === UserRole.STUDENT && profile.studentProfile && (
            <Card className="lg:col-span-2 border-l-4 border-l-blue-500">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Student ID</div>
                      <div className="font-mono text-sm bg-blue-100 px-3 py-2 rounded border">
                        {profile.studentProfile.studentId}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Academic Level</div>
                      <Badge variant="secondary" className="capitalize">
                        {profile.studentProfile.level.toLowerCase()}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Year of Study</div>
                      <div className="font-semibold text-lg text-blue-700">
                        Year {profile.studentProfile.yearOfStudy}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Program</div>
                      <div className="font-medium">{profile.studentProfile.program}</div>
                    </div>
                    {profile.studentProfile.institution && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Institution</div>
                        <div className="font-medium">{profile.studentProfile.institution}</div>
                      </div>
                    )}
                    {profile.studentProfile.gpa && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">GPA</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-blue-700">
                            {profile.studentProfile.gpa.toFixed(2)}
                          </span>
                          <span className="text-gray-500">/ 4.0</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {profile.studentProfile.expectedGraduation && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Expected Graduation</div>
                        <div className="font-medium">
                          {new Date(profile.studentProfile.expectedGraduation).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other role-specific cards would go here following similar AU theme patterns */}
          
          {profile.address && (
            <Card className="lg:col-span-3 border-l-4 border-l-amber-500">
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <MapPin className="h-5 w-5" />
                  Contact Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-50 p-4 rounded border">
                  <p className="whitespace-pre-line text-gray-700">{profile.address}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Account Information */}
        <Card className="mt-6 border-l-4 border-l-gray-500">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Shield className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-gray-500 mb-1">Account Created</div>
                <div className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                <div className="font-medium">
                  {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}