import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SponsorProfileDto {
  @ApiPropertyOptional({
    description: 'Organization name (for organizational sponsors)',
    example: 'Tech Foundation Inc.',
  })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiPropertyOptional({
    description: 'Position in organization',
    example: 'Director of Giving',
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({
    description: 'Type of sponsor',
    enum: ['INDIVIDUAL', 'ORGANIZATION'],
    example: 'INDIVIDUAL',
    default: 'INDIVIDUAL',
  })
  @IsString()
  sponsorType: string;

  @ApiPropertyOptional({
    description: 'Total amount contributed',
    example: 50000,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalContributed?: number;

  @ApiPropertyOptional({
    description: 'Preferred scholarship categories',
    example: ['STEM', 'Underrepresented Minorities', 'Financial Need'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCauses?: string[];

  @ApiPropertyOptional({
    description: 'Whether sponsor is verified',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class UpdateSponsorProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sponsorType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalContributed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCauses?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}