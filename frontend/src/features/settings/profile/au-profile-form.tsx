import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/stores/authStore'
import { usersAPI } from '@/lib/api'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Gender, AcademicLevel, UserRole, type UserResponseDto } from '@/types/user'
import { DatePicker } from '@/components/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  GraduationCap, 
  Eye, 
  Shield, 
  DollarSign,
  School,
  Save,
  ArrowLeft
} from 'lucide-react'

// Base profile schema
const baseProfileSchema = z.object({
  firstName: z
    .string('Please enter your first name.')
    .min(2, 'First name must be at least 2 characters.')
    .max(50, 'First name must not be longer than 50 characters.'),
  lastName: z
    .string('Please enter your last name.')
    .min(2, 'Last name must be at least 2 characters.')
    .max(50, 'Last name must not be longer than 50 characters.'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.nativeEnum(Gender).optional(),
  nationality: z.string().max(50).optional(),
  address: z.string().max(200).optional(),
})

// Student profile schema
const studentProfileSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').max(20),
  program: z.string().min(1, 'Program is required').max(100),
  level: z.nativeEnum(AcademicLevel, { required_error: 'Academic level is required' }),
  yearOfStudy: z.number().min(1, 'Year of study must be at least 1').max(10, 'Year of study cannot exceed 10'),
  gpa: z.number().min(0).max(4.0).optional(),
  institution: z.string().max(100).optional(),
  expectedGraduation: z.string().optional(),
})

// Dynamic schema based on user role
const createProfileFormSchema = (userRole: UserRole) => {
  let schema = baseProfileSchema

  switch (userRole) {
    case UserRole.STUDENT:
      return schema.extend({
        studentProfile: studentProfileSchema,
      })
    // Add other roles as needed
    default:
      return schema
  }
}

interface AUProfileFormProps {
  onBackClick: () => void
}

export default function AUProfileForm({ onBackClick }: AUProfileFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<UserResponseDto | null>(null)

  // Get the dynamic schema based on user role
  const profileFormSchema = user?.role ? createProfileFormSchema(user.role as UserRole) : baseProfileSchema
  type ProfileFormValues = z.infer<typeof profileFormSchema>

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
  })

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const profileData = await usersAPI.getProfile()
          setProfile(profileData)
          
          // Prepare form data based on user role
          const baseFormData = {
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            phoneNumber: profileData.phoneNumber || '',
            dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
            gender: profileData.gender || undefined,
            nationality: profileData.nationality || '',
            address: profileData.address || '',
          }

          let roleSpecificData = {}
          
          // Add role-specific data
          switch (user.role) {
            case 'STUDENT':
              if (profileData.studentProfile) {
                roleSpecificData = {
                  studentProfile: {
                    studentId: profileData.studentProfile.studentId || '',
                    program: profileData.studentProfile.program || '',
                    level: profileData.studentProfile.level,
                    yearOfStudy: profileData.studentProfile.yearOfStudy || 1,
                    gpa: profileData.studentProfile.gpa,
                    institution: profileData.studentProfile.institution || '',
                    expectedGraduation: profileData.studentProfile.expectedGraduation || '',
                  }
                }
              }
              break
          }
          
          // Update form with loaded data
          form.reset({ ...baseFormData, ...roleSpecificData })
        } catch (error) {
          console.error('Failed to load profile:', error)
          toast.error('Failed to load profile data')
        }
      }
    }
    loadProfile()
  }, [user?.id, user?.role, form])

  async function onSubmit(data: ProfileFormValues) {
    if (!user?.id) {
      toast.error('User not found')
      return
    }

    setIsLoading(true)
    try {
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth?.toISOString(),
        gender: data.gender,
        nationality: data.nationality,
        address: data.address,
        // Add role-specific profile data
        ...(user.role === 'STUDENT' && (data as any).studentProfile && {
          studentProfile: (data as any).studentProfile
        }),
      }
      
      await usersAPI.update(user.id, updateData)
      toast.success('Profile updated successfully')
      onBackClick() // Go back to overview
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleTitle = (role: string) => {
    const titleMap = {
      'STUDENT': 'Student Profile',
      'ADMIN': 'Administrator Profile',
      'SPONSOR': 'Sponsor Profile',
      'REVIEWER': 'Reviewer Profile'
    }
    return titleMap[role as keyof typeof titleMap] || 'Profile'
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT': return <GraduationCap className="h-6 w-6" />
      case 'ADMIN': return <Shield className="h-6 w-6" />
      case 'SPONSOR': return <DollarSign className="h-6 w-6" />
      case 'REVIEWER': return <Eye className="h-6 w-6" />
      default: return <User className="h-6 w-6" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBackClick}
                className="text-white hover:bg-blue-500/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  {user?.role && getRoleIcon(user.role)}
                  Edit {user?.role && getRoleTitle(user.role)}
                </h1>
                <p className="text-blue-100">Africa University - Student Information System</p>
              </div>
            </div>
            <School className="h-8 w-8 text-blue-200" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Personal Information */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">First Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder='John' 
                            {...field} 
                            className="border-gray-300 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Your first name as it appears on official documents.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Last Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder='Doe' 
                            {...field}
                            className="border-gray-300 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Your last name as it appears on official documents.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 mt-6">
                  <FormField
                    control={form.control}
                    name='phoneNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type='tel'
                            placeholder='+263 77 123 4567'
                            {...field}
                            className="border-gray-300 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Your phone number for important notifications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='gender'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500">
                              <SelectValue placeholder='Select gender' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Gender.MALE}>Male</SelectItem>
                            <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                            <SelectItem value={Gender.OTHER}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 mt-6">
                  <FormField
                    control={form.control}
                    name='dateOfBirth'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel className="text-gray-700 font-medium">Date of Birth</FormLabel>
                        <DatePicker 
                          selected={field.value} 
                          onSelect={field.onChange}
                        />
                        <FormDescription className="text-gray-500">
                          Your date of birth for verification purposes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='nationality'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Nationality</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Zimbabwean'
                            {...field}
                            className="border-gray-300 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Your full address'
                            className='resize-none border-gray-300 focus:border-blue-500'
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Your residential address for correspondence.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Student Academic Information */}
            {user?.role === UserRole.STUDENT && (
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <GraduationCap className="h-5 w-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name='studentProfile.studentId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Student ID *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder='STU2024001' 
                              {...field}
                              className="border-gray-300 focus:border-blue-500 font-mono"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Your official student identification number.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='studentProfile.institution'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Institution</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder='Africa University' 
                              {...field}
                              className="border-gray-300 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3 mt-6">
                    <FormField
                      control={form.control}
                      name='studentProfile.program'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Program *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Bachelor of Computer Science'
                              {...field}
                              className="border-gray-300 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Your specific degree program.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='studentProfile.level'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Academic Level *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                                <SelectValue placeholder='Select level' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={AcademicLevel.UNDERGRADUATE}>Undergraduate</SelectItem>
                              <SelectItem value={AcademicLevel.MASTERS}>Masters</SelectItem>
                              <SelectItem value={AcademicLevel.PHD}>PhD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='studentProfile.yearOfStudy'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Year of Study *</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              placeholder='3'
                              min='1'
                              max='10'
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              className="border-gray-300 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Your current year of study.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 mt-6">
                    <FormField
                      control={form.control}
                      name='studentProfile.gpa'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">GPA</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step='0.01'
                              min='0'
                              max='4.0'
                              placeholder='3.75'
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="border-gray-300 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Your current Grade Point Average (0.0 - 4.0 scale).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='studentProfile.expectedGraduation'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Expected Graduation</FormLabel>
                          <FormControl>
                            <Input
                              type='date'
                              {...field}
                              className="border-gray-300 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            When you expect to graduate.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBackClick}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type='submit' 
                disabled={isLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}