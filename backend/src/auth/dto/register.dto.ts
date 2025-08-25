import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  SPONSOR = 'SPONSOR',
  REVIEWER = 'REVIEWER',
}

export class RegisterDto {
  @ApiProperty({
    example: 'student@africau.edu',
    description: 'The email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'Role of the user',
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}