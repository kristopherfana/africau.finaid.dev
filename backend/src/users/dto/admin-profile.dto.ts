import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminProfileDto {
  @ApiProperty({
    description: 'Admin permissions',
    example: ['USER_MANAGEMENT', 'SCHOLARSHIP_MANAGEMENT', 'REPORT_ACCESS'],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @ApiPropertyOptional({
    description: 'Departments under management',
    example: ['Engineering', 'Computer Science'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  managedDepartments?: string[];

  @ApiPropertyOptional({
    description: 'Access level',
    enum: ['STANDARD', 'SUPER_ADMIN'],
    example: 'STANDARD',
    default: 'STANDARD',
  })
  @IsOptional()
  @IsString()
  accessLevel?: string;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  lastLogin?: string;
}

export class UpdateAdminProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  managedDepartments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accessLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastLogin?: string;
}