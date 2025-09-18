import { IsString, IsOptional, IsEmail, IsUrl } from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}
