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

const programs = [
  'Bachelor of Computer Science',
  'Bachelor of Information Technology',
  'Bachelor of Software Engineering',
  'Bachelor of Business Administration',
  'Bachelor of Commerce',
  'Bachelor of Accounting',
  'Bachelor of Economics',
  'Bachelor of Engineering',
  'Bachelor of Arts',
  'Bachelor of Science',
  'Master of Computer Science',
  'Master of Business Administration',
  'Master of Science',
  'Master of Arts',
  'Doctor of Philosophy (PhD)',
  'Other',
] as const

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
  expectedGraduation: z.string().optional(),
})

// Reviewer profile schema
const reviewerProfileSchema = z.object({
  expertiseAreas: z.array(z.string()).min(1, 'At least one expertise area is required'),
  department: z.string().max(100).optional(),
  yearsExperience: z.number().min(0).max(50).optional(),
  certifications: z.array(z.string()).optional(),
  reviewQuota: z.number().min(1).max(100).optional(),
})

// Admin profile schema
const adminProfileSchema = z.object({
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  managedDepartments: z.array(z.string()).optional(),
  accessLevel: z.enum(['STANDARD', 'SUPER_ADMIN']).optional(),
})

// Sponsor profile schema
const sponsorProfileSchema = z.object({
  organizationName: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  sponsorType: z.enum(['INDIVIDUAL', 'ORGANIZATION']),
  totalContributed: z.number().min(0).optional(),
  preferredCauses: z.array(z.string()).optional(),
})

// Dynamic schema based on user role
const createProfileFormSchema = (userRole: UserRole) => {
  let schema = baseProfileSchema

  switch (userRole) {
    case UserRole.STUDENT:
      return schema.extend({
        studentProfile: studentProfileSchema,
      })
    case UserRole.REVIEWER:
      return schema.extend({
        reviewerProfile: reviewerProfileSchema,
      })
    case UserRole.ADMIN:
      return schema.extend({
        adminProfile: adminProfileSchema,
      })
    case UserRole.SPONSOR:
      return schema.extend({
        sponsorProfile: sponsorProfileSchema,
      })
    default:
      return schema
  }
}

export default function ProfileForm() {
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
                    expectedGraduation: profileData.studentProfile.expectedGraduation || '',
                  }
                }
              }
              break
            case 'REVIEWER':
              if (profileData.reviewerProfile) {
                roleSpecificData = {
                  reviewerProfile: {
                    expertiseAreas: profileData.reviewerProfile.expertiseAreas || [],
                    department: profileData.reviewerProfile.department || '',
                    yearsExperience: profileData.reviewerProfile.yearsExperience,
                    certifications: profileData.reviewerProfile.certifications || [],
                    reviewQuota: profileData.reviewerProfile.reviewQuota,
                  }
                }
              }
              break
            case 'ADMIN':
              if (profileData.adminProfile) {
                roleSpecificData = {
                  adminProfile: {
                    permissions: profileData.adminProfile.permissions || [],
                    managedDepartments: profileData.adminProfile.managedDepartments || [],
                    accessLevel: profileData.adminProfile.accessLevel as 'STANDARD' | 'SUPER_ADMIN',
                  }
                }
              }
              break
            case 'SPONSOR':
              if (profileData.sponsorProfile) {
                roleSpecificData = {
                  sponsorProfile: {
                    organizationName: profileData.sponsorProfile.organizationName || '',
                    position: profileData.sponsorProfile.position || '',
                    sponsorType: profileData.sponsorProfile.sponsorType as 'INDIVIDUAL' | 'ORGANIZATION',
                    totalContributed: profileData.sponsorProfile.totalContributed,
                    preferredCauses: profileData.sponsorProfile.preferredCauses || [],
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
        ...(user.role === 'REVIEWER' && (data as any).reviewerProfile && {
          reviewerProfile: (data as any).reviewerProfile
        }),
        ...(user.role === 'ADMIN' && (data as any).adminProfile && {
          adminProfile: (data as any).adminProfile
        }),
        ...(user.role === 'SPONSOR' && (data as any).sponsorProfile && {
          sponsorProfile: (data as any).sponsorProfile
        }),
      }
      
      await usersAPI.update(user.id, updateData)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderBaseProfileFields = () => (
    <div className='space-y-6'>
      <div className='border-b pb-4'>
        <h3 className='text-lg font-medium'>Basic Information</h3>
        <p className='text-sm text-muted-foreground'>
          Update your personal information and contact details.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 items-start'>
        <FormField
          control={form.control}
          name='firstName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder='John' className='h-10' {...field} />
              </FormControl>
              <FormDescription>
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
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder='Doe' className='h-10' {...field} />
              </FormControl>
              <FormDescription>
                Your last name as it appears on official documents.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name='phoneNumber'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input
                type='tel'
                placeholder='+263 77 123 4567'
                className='h-10'
                {...field}
              />
            </FormControl>
            <FormDescription>
              Your phone number for important notifications.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid gap-4 md:grid-cols-2 items-start'>
        <FormField
          control={form.control}
          name='dateOfBirth'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Date of Birth</FormLabel>
              <DatePicker selected={field.value} onSelect={field.onChange} />
              <FormDescription>
                Your date of birth for verification purposes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='gender'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='h-10'>
                    <SelectValue placeholder='Select gender' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={Gender.MALE}>Male</SelectItem>
                  <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                  <SelectItem value={Gender.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select your gender identity.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2 items-start'>
        <FormField
          control={form.control}
          name='nationality'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationality</FormLabel>
              <FormControl>
                <Input
                  placeholder='Zimbabwean'
                  className='h-10'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your country of citizenship.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div></div>
      </div>

      <FormField
        control={form.control}
        name='address'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea
                placeholder='Your full address'
                className='resize-none'
                {...field}
              />
            </FormControl>
            <FormDescription>
              Your residential address for correspondence.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  const renderReviewerProfileFields = () => (
    <div className='space-y-6'>
      <div className='border-b pb-4'>
        <h3 className='text-lg font-medium'>Reviewer Information</h3>
        <p className='text-sm text-muted-foreground'>
          Information about your expertise and review capabilities.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 items-start'>
        <FormField
          control={form.control}
          name='reviewerProfile.department'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder='Computer Science' className='h-10' {...field} />
              </FormControl>
              <FormDescription>
                Your department or faculty affiliation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='reviewerProfile.yearsExperience'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='10'
                  min='0'
                  max='50'
                  className='h-10'
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                Years of professional experience in your field.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name='reviewerProfile.reviewQuota'
        render={({ field }) => (
          <FormItem className='md:w-1/3'>
            <FormLabel>Monthly Review Quota</FormLabel>
            <FormControl>
              <Input
                type='number'
                placeholder='10'
                min='1'
                max='100'
                className='h-10'
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </FormControl>
            <FormDescription>
              Maximum number of applications you can review per month.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  const renderAdminProfileFields = () => (
    <div className='space-y-6'>
      <div className='border-b pb-4'>
        <h3 className='text-lg font-medium'>Administrative Information</h3>
        <p className='text-sm text-muted-foreground'>
          Information about your administrative role and permissions.
        </p>
      </div>

      <FormField
        control={form.control}
        name='adminProfile.accessLevel'
        render={({ field }) => (
          <FormItem className='md:w-1/3'>
            <FormLabel>Access Level</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className='h-10'>
                  <SelectValue placeholder='Select access level' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value='STANDARD'>Standard Admin</SelectItem>
                <SelectItem value='SUPER_ADMIN'>Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Your administrative access level.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  const renderSponsorProfileFields = () => (
    <div className='space-y-6'>
      <div className='border-b pb-4'>
        <h3 className='text-lg font-medium'>Sponsor Information</h3>
        <p className='text-sm text-muted-foreground'>
          Information about your sponsorship details and preferences.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 items-start'>
        <FormField
          control={form.control}
          name='sponsorProfile.sponsorType'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sponsor Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='h-10'>
                    <SelectValue placeholder='Select sponsor type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='INDIVIDUAL'>Individual</SelectItem>
                  <SelectItem value='ORGANIZATION'>Organization</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Whether you're sponsoring as an individual or organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='sponsorProfile.organizationName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder='Tech Foundation Inc.' className='h-10' {...field} />
              </FormControl>
              <FormDescription>
                Name of your organization (if applicable).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2 items-start'>
        <FormField
          control={form.control}
          name='sponsorProfile.position'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <FormControl>
                <Input placeholder='Director of Giving' className='h-10' {...field} />
              </FormControl>
              <FormDescription>
                Your position in the organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='sponsorProfile.totalContributed'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Contributed</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='50000'
                  min='0'
                  className='h-10'
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                Total amount contributed to scholarships (USD).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )

  const renderStudentProfileFields = () => (
    <div className='space-y-6'>
      <div className='border-b pb-4'>
        <h3 className='text-lg font-medium'>Academic Information</h3>
        <p className='text-sm text-muted-foreground'>
          Information about your academic program and performance.
        </p>
      </div>

      <FormField
        control={form.control}
        name='studentProfile.program'
        render={({ field }) => (
          <FormItem className='md:w-2/3'>
            <FormLabel>Program</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className='h-10'>
                  <SelectValue placeholder='Select your program' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Your specific degree program.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='studentProfile.studentId'
        render={({ field }) => (
          <FormItem className='md:w-1/2'>
            <FormLabel>Student ID</FormLabel>
            <FormControl>
              <Input placeholder='STU2024001' className='h-10' {...field} />
            </FormControl>
            <FormDescription>
              Your official student identification number.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid gap-4 md:grid-cols-3 items-start'>
        <FormField
          control={form.control}
          name='studentProfile.level'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='h-10'>
                    <SelectValue placeholder='Select level' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={AcademicLevel.UNDERGRADUATE}>Undergraduate</SelectItem>
                  <SelectItem value={AcademicLevel.MASTERS}>Masters</SelectItem>
                  <SelectItem value={AcademicLevel.PHD}>PhD</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Your current academic level.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='studentProfile.yearOfStudy'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year of Study</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='3'
                  min='1'
                  max='10'
                  className='h-10'
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                Your current year of study.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div></div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 items-start'>
        <FormField
          control={form.control}
          name='studentProfile.gpa'
          render={({ field }) => (
            <FormItem>
              <FormLabel>GPA</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.01'
                  min='0'
                  max='4.0'
                  placeholder='3.75'
                  className='h-10'
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
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
              <FormLabel>Expected Graduation</FormLabel>
              <FormControl>
                <Input
                  type='date'
                  className='h-10'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                When you expect to graduate.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {renderBaseProfileFields()}
        
        {user?.role === UserRole.STUDENT && renderStudentProfileFields()}
        {user?.role === UserRole.REVIEWER && renderReviewerProfileFields()}
        {user?.role === UserRole.ADMIN && renderAdminProfileFields()}
        {user?.role === UserRole.SPONSOR && renderSponsorProfileFields()}
        
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update profile'}
        </Button>
      </form>
    </Form>
  )
}