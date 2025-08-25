import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDate, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ScholarshipStatus {
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
    enum: ScholarshipType,
    example: ScholarshipType.FULL,
    description: 'Type of scholarship',
  })
  @IsEnum(ScholarshipType)
  type: ScholarshipType;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Application start date',
  })
  @Type(() => Date)
  @IsDate()
  applicationStartDate: Date;

  @ApiProperty({
    example: '2024-03-31',
    description: 'Application deadline',
  })
  @Type(() => Date)
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