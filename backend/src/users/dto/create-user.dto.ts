import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';

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
    example: 'ST2024001',
    description: 'Student ID for students',
    required: false,
  })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'Role of the user',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: 'Computer Science',
    description: 'Department or field of study',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    example: 3,
    description: 'Current year of study (for students)',
    required: false,
  })
  @IsOptional()
  yearOfStudy?: number;

  @ApiProperty({
    example: 3.75,
    description: 'Current GPA (for students)',
    required: false,
  })
  @IsOptional()
  gpa?: number;
}