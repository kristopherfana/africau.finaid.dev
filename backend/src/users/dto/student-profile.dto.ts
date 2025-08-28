import { IsString, IsInt, IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentProfileDto {
  @ApiProperty({
    description: 'Unique student ID',
    example: 'STU2024001',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: 'Academic program/major',
    example: 'Computer Science',
  })
  @IsString()
  program: string;

  @ApiProperty({
    description: 'Academic level',
    enum: ['UNDERGRADUATE', 'MASTERS', 'PHD'],
    example: 'UNDERGRADUATE',
  })
  @IsString()
  level: string;

  @ApiProperty({
    description: 'Current year of study',
    example: 2,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  yearOfStudy: number;

  @ApiPropertyOptional({
    description: 'Grade Point Average',
    example: 3.75,
    minimum: 0,
    maximum: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @ApiPropertyOptional({
    description: 'Name of institution',
    example: 'University of Technology',
  })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({
    description: 'Expected graduation date',
    example: '2025-06-15',
  })
  @IsOptional()
  @IsDateString()
  expectedGraduation?: string;
}

export class UpdateStudentProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  yearOfStudy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedGraduation?: string;
}