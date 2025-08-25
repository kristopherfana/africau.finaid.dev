import { Injectable } from '@nestjs/common';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // TODO: Implement actual authentication logic
    return {
      access_token: 'mock-jwt-token',
      user: {
        id: '1',
        email: loginDto.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    // TODO: Implement actual registration logic
    return {
      access_token: 'mock-jwt-token',
      user: {
        id: '1',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role || 'STUDENT',
      },
    };
  }
}
