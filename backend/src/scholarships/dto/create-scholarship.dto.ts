import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDate, IsOptional, IsEnum, Min, Max, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum ScholarshipStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  SUSPENDED = 'SUSPENDED',
}

export enum ScholarshipType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  MERIT_BASED = 'MERIT_BASED',
  NEED_BASED = 'NEED_BASED',
}

export class CreateScholarshipDto {
  @ApiProperty({
    example: 'Excellence Scholarship 2024',
    description: 'Name of the scholarship',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'This scholarship is awarded to students with exceptional academic performance',
    description: 'Detailed description of the scholarship',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 50000,
    description: 'Amount of the scholarship in USD',
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: 'African Development Bank',
    description: 'Name of the sponsor',
  })
  @IsString()
  @IsNotEmpty()
  sponsor: string;

  @ApiProperty({
    example: 'sponsor-uuid-here',
    description: 'ID of the sponsor',
    required: false,
  })
  @IsString()
  @IsOptional()
  sponsorId?: string;

  @ApiProperty({
    enum: ScholarshipType,
    example: ScholarshipType.FULL,
    description: 'Type of scholarship',
  })
  @IsEnum(ScholarshipType)
  type: ScholarshipType;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Application start date (ISO 8601 format, also accepts YYYY-MM-DD)',
    type: 'string',
    format: 'date-time'
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Handle YYYY-MM-DD format by adding time component
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(value + 'T00:00:00.000Z');
      }
      // Handle ISO format
      return new Date(value);
    }
    return value;
  })
  @IsDate()
  applicationStartDate: Date;

  @ApiProperty({
    example: '2024-03-31T23:59:59.999Z',
    description: 'Application deadline (ISO 8601 format, also accepts YYYY-MM-DD)',
    type: 'string',
    format: 'date-time'
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Handle YYYY-MM-DD format by adding end-of-day time component
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(value + 'T23:59:59.999Z');
      }
      // Handle ISO format
      return new Date(value);
    }
    return value;
  })
  @IsDate()
  applicationDeadline: Date;

  @ApiProperty({
    example: ['Minimum GPA of 3.5', 'Full-time enrollment', 'Financial need demonstration'],
    description: 'Eligibility criteria',
  })
  @IsString({ each: true })
  eligibilityCriteria: string[];

  @ApiProperty({
    example: 100,
    description: 'Maximum number of recipients',
  })
  @IsNumber()
  @Min(1)
  maxRecipients: number;

  @ApiProperty({
    enum: ScholarshipStatus,
    example: ScholarshipStatus.OPEN,
    description: 'Status of the scholarship',
    required: false,
  })
  @IsEnum(ScholarshipStatus)
  @IsOptional()
  status?: ScholarshipStatus;
}