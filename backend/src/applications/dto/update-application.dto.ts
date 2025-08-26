import { PartialType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-application.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @ApiProperty({
    example: 'Application needs more documentation',
    description: 'Review comments from admin/reviewer',
    required: false,
  })
  @IsString()
  @IsOptional()
  reviewComments?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the reviewer',
    required: false,
  })
  @IsString()
  @IsOptional()
  reviewedBy?: string;
}