import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Gender } from './create-user.dto';
import { StudentProfileDto } from './student-profile.dto';
import { ReviewerProfileDto } from './reviewer-profile.dto';
import { AdminProfileDto } from './admin-profile.dto';
import { SponsorProfileDto } from './sponsor-profile.dto';

export class UserResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: 'student@africau.edu',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  lastName: string;

  @ApiProperty({
    example: '+263771234567',
    description: 'Phone number of the user',
  })
  phoneNumber?: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Gender of the user',
  })
  gender?: Gender;

  @ApiProperty({
    example: '2001-05-15',
    description: 'Date of birth',
  })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: 'Zimbabwean',
    description: 'Nationality of the user',
  })
  nationality?: string;

  @ApiPropertyOptional({
    example: '123 Main Street, Harare, Zimbabwe',
    description: 'Address of the user',
  })
  address?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'Role of the user',
  })
  role: UserRole;

  @ApiProperty({
    example: true,
    description: 'Whether the user account is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the email is verified',
  })
  emailVerified: boolean;

  @ApiProperty({
    example: '2024-01-01T10:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T14:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  // Role-specific profile data
  @ApiPropertyOptional({
    description: 'Student-specific profile data (only for STUDENT role)',
  })
  studentProfile?: StudentProfileDto;

  @ApiPropertyOptional({
    description: 'Reviewer-specific profile data (only for REVIEWER role)',
  })
  reviewerProfile?: ReviewerProfileDto;

  @ApiPropertyOptional({
    description: 'Admin-specific profile data (only for ADMIN role)',
  })
  adminProfile?: AdminProfileDto;

  @ApiPropertyOptional({
    description: 'Sponsor-specific profile data (only for SPONSOR role)',
  })
  sponsorProfile?: SponsorProfileDto;
}