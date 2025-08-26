import { ApiProperty } from '@nestjs/swagger';
import { ScholarshipStatus, ScholarshipType } from './create-scholarship.dto';

export class ScholarshipResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the scholarship',
  })
  id: string;

  @ApiProperty({
    example: 'Excellence Scholarship 2024',
    description: 'Name of the scholarship',
  })
  name: string;

  @ApiProperty({
    example: 'This scholarship is awarded to students with exceptional academic performance',
    description: 'Detailed description of the scholarship',
  })
  description: string;

  @ApiProperty({
    example: 50000,
    description: 'Amount of the scholarship in USD',
  })
  amount: number;

  @ApiProperty({
    example: 'African Development Bank',
    description: 'Name of the sponsor',
  })
  sponsor: string;

  @ApiProperty({
    enum: ScholarshipType,
    example: ScholarshipType.FULL,
    description: 'Type of scholarship',
  })
  type: ScholarshipType;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Application start date',
  })
  applicationStartDate: Date;

  @ApiProperty({
    example: '2024-03-31T23:59:59.000Z',
    description: 'Application deadline',
  })
  applicationDeadline: Date;

  @ApiProperty({
    example: ['Minimum GPA of 3.5', 'Full-time enrollment', 'Financial need demonstration'],
    description: 'Eligibility criteria',
  })
  eligibilityCriteria: string[];

  @ApiProperty({
    example: 100,
    description: 'Maximum number of recipients',
  })
  maxRecipients: number;

  @ApiProperty({
    example: 45,
    description: 'Current number of applications',
  })
  currentApplications: number;

  @ApiProperty({
    enum: ScholarshipStatus,
    example: ScholarshipStatus.OPEN,
    description: 'Status of the scholarship',
  })
  status: ScholarshipStatus;

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