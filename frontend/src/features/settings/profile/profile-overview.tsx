import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Eye,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  User,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserResponseDto, UserRole } from '@/types/user'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProfileImageUpload } from '@/components/profile-image-upload'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAuth } from '@/stores/authStore'
import { usersAPI } from '@/lib/api'

interface ProfileOverviewProps {
  onEditClick: () => void
}

export function ProfileOverview({ onEditClick }: ProfileOverviewProps) {
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
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-20 w-20 rounded-full bg-gray-200" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No profile data available.
          </p>
        </CardContent>
      </Card>
    )
  }

  const userDisplayName = `${profile.firstName} ${profile.lastName}`
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <ProfileImageUpload
                currentImage={profile.profilePicture}
                userName={userDisplayName}
                size="md"
                onImageChange={(imageUrl) => {
                  // TODO: Update profile picture in backend when endpoint is available
                  console.log('New image:', imageUrl)
                }}
              />
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold">{userDisplayName}</h1>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <Badge variant="secondary" className="capitalize">
                    {profile.role.toLowerCase()}
                  </Badge>
                  
                  {/* Role-specific badges */}
                  {profile.role === UserRole.STUDENT && profile.studentProfile && (
                    <Badge variant="outline">ID: {profile.studentProfile.studentId}</Badge>
                  )}
                  
                  {profile.role === UserRole.REVIEWER && profile.reviewerProfile && (
                    <Badge variant="outline">
                      Reviews: {profile.reviewerProfile.reviewQuota || 10}/month
                    </Badge>
                  )}
                  
                  {profile.role === UserRole.ADMIN && profile.adminProfile && (
                    <Badge variant="outline" className="capitalize">
                      {profile.adminProfile.accessLevel?.toLowerCase() || 'standard'} Admin
                    </Badge>
                  )}
                  
                  {profile.role === UserRole.SPONSOR && profile.sponsorProfile && (
                    <Badge variant="outline" className="capitalize">
                      {profile.sponsorProfile.sponsorType?.toLowerCase()} Sponsor
                    </Badge>
                  )}
                  
                  <Badge variant={profile.isActive ? "default" : "destructive"}>
                    {profile.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={profile.emailVerified ? "default" : "secondary"}>
                    {profile.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={onEditClick} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information Grid */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                </div>
                <span className="text-right truncate max-w-[140px]" title={profile.email}>{profile.email}</span>
              </div>
              {profile.phoneNumber && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                  </div>
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
              {profile.dateOfBirth && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date of Birth:</span>
                  </div>
                  <span>{new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
              {profile.gender && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Gender:</span>
                  </div>
                  <span className="capitalize">{profile.gender.toLowerCase()}</span>
                </div>
              )}
              {profile.nationality && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Nationality:</span>
                  </div>
                  <span>{profile.nationality}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Information */}
        {profile.role === UserRole.STUDENT && profile.studentProfile && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Academic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Student ID:</span>
                    </div>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{profile.studentProfile.studentId}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Level:</span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {profile.studentProfile.level.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Year of Study:</span>
                    </div>
                    <span className="font-semibold">Year {profile.studentProfile.yearOfStudy}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Program:</span>
                    </div>
                    <span className="text-right max-w-[120px] truncate" title={profile.studentProfile.program}>
                      {profile.studentProfile.program}
                    </span>
                  </div>
                  {profile.studentProfile.gpa && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">GPA:</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{profile.studentProfile.gpa.toFixed(2)}</span>
                        <span className="text-muted-foreground">/ 4.0</span>
                      </div>
                    </div>
                  )}
                  {profile.studentProfile.institution && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Institution:</span>
                      </div>
                      <span className="text-right max-w-[120px] truncate" title={profile.studentProfile.institution}>
                        {profile.studentProfile.institution}
                      </span>
                    </div>
                  )}
                </div>
                
                {profile.studentProfile.expectedGraduation && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Expected Graduation:</span>
                      </div>
                      <span className="text-right">
                        {new Date(profile.studentProfile.expectedGraduation).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviewer Information */}
        {profile.role === UserRole.REVIEWER && profile.reviewerProfile && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Reviewer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {profile.reviewerProfile.department && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Department:</span>
                        </div>
                        <span>{profile.reviewerProfile.department}</span>
                      </div>
                    )}
                    {profile.reviewerProfile.yearsExperience && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Experience:</span>
                        </div>
                        <span className="font-semibold">{profile.reviewerProfile.yearsExperience} years</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Monthly Quota:</span>
                      </div>
                      <span className="font-semibold">{profile.reviewerProfile.reviewQuota || 10} reviews</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Status:</span>
                      </div>
                      <Badge variant={profile.reviewerProfile.isActive ? "default" : "secondary"}>
                        {profile.reviewerProfile.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {profile.reviewerProfile.expertiseAreas && profile.reviewerProfile.expertiseAreas.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-medium text-sm flex items-center space-x-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>Expertise Areas:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.reviewerProfile.expertiseAreas.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.reviewerProfile.certifications && profile.reviewerProfile.certifications.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-medium text-sm flex items-center space-x-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span>Certifications:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.reviewerProfile.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Information */}
        {profile.role === UserRole.ADMIN && profile.adminProfile && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Administrative Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Access Level:</span>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {profile.adminProfile.accessLevel?.toLowerCase() || 'standard'}
                      </Badge>
                    </div>
                    {profile.adminProfile.lastLogin && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Last Login:</span>
                        </div>
                        <span>{new Date(profile.adminProfile.lastLogin).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {profile.adminProfile.permissions && profile.adminProfile.permissions.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-medium text-sm flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>Permissions:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.adminProfile.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs capitalize">
                            {permission.replace('_', ' ').toLowerCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.adminProfile.managedDepartments && profile.adminProfile.managedDepartments.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-medium text-sm flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>Managed Departments:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.adminProfile.managedDepartments.map((dept, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sponsor Information */}
        {profile.role === UserRole.SPONSOR && profile.sponsorProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Sponsor Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Sponsor Type:</span>
                  <Badge variant="secondary" className="ml-1 capitalize">
                    {profile.sponsorProfile.sponsorType.toLowerCase()}
                  </Badge>
                </div>
                {profile.sponsorProfile.organizationName && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Organization:</span>
                    <span>{profile.sponsorProfile.organizationName}</span>
                  </div>
                )}
                {profile.sponsorProfile.position && (
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Position:</span>
                    <span>{profile.sponsorProfile.position}</span>
                  </div>
                )}
                {profile.sponsorProfile.totalContributed !== undefined && (
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Total Contributed:</span>
                    <span>${profile.sponsorProfile.totalContributed.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Verification Status:</span>
                  <Badge variant={profile.sponsorProfile.isVerified ? "default" : "secondary"} className="ml-1">
                    {profile.sponsorProfile.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                {profile.sponsorProfile.preferredCauses && profile.sponsorProfile.preferredCauses.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-medium text-sm">Preferred Causes:</span>
                    <div className="flex flex-wrap gap-1">
                      {profile.sponsorProfile.preferredCauses.map((cause, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cause}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact & Address Information */}
        {(profile.address || profile.phoneNumber) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Contact & Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.address && (
                <div className="space-y-2">
                  <span className="font-medium text-sm">Address:</span>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {profile.address}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="font-medium text-sm">Account Created:</span>
              <p className="text-sm text-muted-foreground">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <span className="font-medium text-sm">Last Updated:</span>
              <p className="text-sm text-muted-foreground">
                {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}