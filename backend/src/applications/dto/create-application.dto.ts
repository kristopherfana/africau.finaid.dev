import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray, IsEnum } from 'class-validator';

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export class CreateApplicationDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the scholarship cycle being applied for',
  })
  @IsUUID()
  @IsNotEmpty()
  cycleId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID of the applicant',
  })
  @IsUUID()
  @IsNotEmpty()
  applicantId: string;

  @ApiProperty({
    example: 'I am applying for this scholarship because...',
    description: 'Personal statement or motivation letter',
  })
  @IsString()
  @IsNotEmpty()
  personalStatement: string;

  @ApiProperty({
    example: {
      gpa: 3.8,
      major: 'Computer Science',
      yearOfStudy: 3,
      achievements: ['Dean\'s List 2023', 'Best Student Award'],
    },
    description: 'Academic information',
  })
  @IsOptional()
  academicInfo?: Record<string, any>;

  @ApiProperty({
    example: {
      familyIncome: 35000,
      dependents: 3,
      financialNeed: 'High',
    },
    description: 'Financial information',
  })
  @IsOptional()
  financialInfo?: Record<string, any>;

  @ApiProperty({
    example: ['transcript.pdf', 'recommendation1.pdf', 'recommendation2.pdf'],
    description: 'List of document IDs attached to the application',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documentIds?: string[];

  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.DRAFT,
    description: 'Status of the application',
    required: false,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;
}