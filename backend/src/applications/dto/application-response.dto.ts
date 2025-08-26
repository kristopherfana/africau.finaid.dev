import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from './create-application.dto';

export class ApplicationResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the application',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the scholarship',
  })
  scholarshipId: string;

  @ApiProperty({
    example: 'Excellence Scholarship 2024',
    description: 'Name of the scholarship',
  })
  scholarshipName: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID of the applicant',
  })
  applicantId: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the applicant',
  })
  applicantName: string;

  @ApiProperty({
    example: 'student@africau.edu',
    description: 'Email of the applicant',
  })
  applicantEmail: string;

  @ApiProperty({
    example: 'I am applying for this scholarship because...',
    description: 'Personal statement or motivation letter',
  })
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
  academicInfo: Record<string, any>;

  @ApiProperty({
    example: {
      familyIncome: 35000,
      dependents: 3,
      financialNeed: 'High',
    },
    description: 'Financial information',
  })
  financialInfo: Record<string, any>;

  @ApiProperty({
    example: ['transcript.pdf', 'recommendation1.pdf', 'recommendation2.pdf'],
    description: 'List of document IDs',
  })
  documentIds: string[];

  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.SUBMITTED,
    description: 'Current status of the application',
  })
  status: ApplicationStatus;

  @ApiProperty({
    example: 'Application needs more documentation',
    description: 'Review comments',
  })
  reviewComments?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the reviewer',
  })
  reviewedBy?: string;

  @ApiProperty({
    example: '2024-01-15T10:00:00.000Z',
    description: 'Submission date',
  })
  submittedAt?: Date;

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
}