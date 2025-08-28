import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsPhoneNumber, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { StudentProfileDto } from './student-profile.dto';
import { ReviewerProfileDto } from './reviewer-profile.dto';
import { AdminProfileDto } from './admin-profile.dto';
import { SponsorProfileDto } from './sponsor-profile.dto';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  SPONSOR = 'SPONSOR',
  REVIEWER = 'REVIEWER',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class CreateUserDto {
  @ApiProperty({
    example: 'student@africau.edu',
    description: 'Email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the user account',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'Zimbabwean',
    description: 'Nationality of the user',
  })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional({
    example: '123 Main Street, Harare, Zimbabwe',
    description: 'Address of the user',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '+263771234567',
    description: 'Phone number of the user',
    required: false,
  })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Gender of the user',
    required: false,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    example: '2001-05-15',
    description: 'Date of birth',
    required: false,
  })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'Role of the user',
  })
  @IsEnum(UserRole)
  role: UserRole;

  // Role-specific profile data
  @ApiPropertyOptional({
    description: 'Student profile data (required for STUDENT role)',
    type: StudentProfileDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StudentProfileDto)
  @IsObject()
  studentProfile?: StudentProfileDto;

  @ApiPropertyOptional({
    description: 'Reviewer profile data (required for REVIEWER role)',
    type: ReviewerProfileDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReviewerProfileDto)
  @IsObject()
  reviewerProfile?: ReviewerProfileDto;

  @ApiPropertyOptional({
    description: 'Admin profile data (required for ADMIN role)',
    type: AdminProfileDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminProfileDto)
  @IsObject()
  adminProfile?: AdminProfileDto;

  @ApiPropertyOptional({
    description: 'Sponsor profile data (required for SPONSOR role)',
    type: SponsorProfileDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SponsorProfileDto)
  @IsObject()
  sponsorProfile?: SponsorProfileDto;
}