import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if student ID already exists (for students)
    if (createUserDto.studentId) {
      const existingStudentId = await this.prisma.user.findFirst({
        where: {
          profile: {
            studentId: createUserDto.studentId,
          },
        },
      });
      
      if (existingStudentId) {
        throw new ConflictException('Student ID already exists');
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if ((createUserDto as any).password) {
      hashedPassword = await bcrypt.hash((createUserDto as any).password, 10);
    }

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
        profile: {
          create: {
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            phone: createUserDto.phoneNumber,
            gender: createUserDto.gender,
            dateOfBirth: createUserDto.dateOfBirth,
            studentId: createUserDto.studentId,
            program: createUserDto.department,
            yearOfStudy: createUserDto.yearOfStudy,
            gpa: createUserDto.gpa,
          },
        },
      },
      include: { profile: true },
    });

    return this.mapToUserResponse(user);
  }

  async findAll(filters: {
    role?: string;
    department?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UserResponseDto[]> {
    const where: any = {};

    // Apply filters
    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      where.OR = [
        { profile: { firstName: { contains: searchLower } } },
        { profile: { lastName: { contains: searchLower } } },
        { email: { contains: searchLower } },
      ];
    }

    if (filters.department) {
      where.profile = {
        ...where.profile,
        program: { contains: filters.department },
      };
    }

    const skip = filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined;
    const take = filters.limit || undefined;

    const users = await this.prisma.user.findMany({
      where,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    return users.map(user => this.mapToUserResponse(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return this.mapToUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check for student ID conflicts if student ID is being updated
    if (updateUserDto.studentId && updateUserDto.studentId !== user.profile?.studentId) {
      const studentIdExists = await this.prisma.user.findFirst({
        where: {
          profile: {
            studentId: updateUserDto.studentId,
          },
          NOT: { id },
        },
      });
      
      if (studentIdExists) {
        throw new ConflictException('Student ID already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        profile: {
          update: {
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
            phone: updateUserDto.phoneNumber,
            gender: updateUserDto.gender,
            dateOfBirth: updateUserDto.dateOfBirth,
            studentId: updateUserDto.studentId,
            program: updateUserDto.department,
            yearOfStudy: updateUserDto.yearOfStudy,
            gpa: updateUserDto.gpa,
          },
        },
      },
      include: { profile: true },
    });

    return this.mapToUserResponse(updatedUser);
  }

  async activate(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToUserResponse(user);
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToUserResponse(user);
  }

  async verifyEmail(id: string): Promise<UserResponseDto> {
    // For now, we'll just return the user as email verification is not implemented
    const user = await this.findOne(id);
    return user;
  }

  async changePassword(
    id: string,
    passwordData: { currentPassword: string; newPassword: string }
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!user.password) {
      throw new BadRequestException('User does not have a password set');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (passwordData.newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Delete the user (this will cascade to delete the profile)
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: { isActive: true },
    });

    // Calculate users by role
    const studentCount = await this.prisma.user.count({
      where: { role: UserRole.STUDENT },
    });
    const adminCount = await this.prisma.user.count({
      where: { role: UserRole.ADMIN },
    });
    const sponsorCount = await this.prisma.user.count({
      where: { role: UserRole.SPONSOR },
    });
    const reviewerCount = await this.prisma.user.count({
      where: { role: UserRole.REVIEWER },
    });

    // Calculate new users this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: thisMonth,
        },
      },
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      byRole: {
        STUDENT: studentCount,
        ADMIN: adminCount,
        SPONSOR: sponsorCount,
        REVIEWER: reviewerCount,
      },
      newUsersThisMonth,
      verifiedUsers: totalUsers, // For now, assume all users are verified
      unverifiedUsers: 0,
    };
  }

  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      phoneNumber: user.profile?.phone || undefined,
      gender: user.profile?.gender || undefined,
      dateOfBirth: user.profile?.dateOfBirth || undefined,
      studentId: user.profile?.studentId || undefined,
      role: user.role as UserRole,
      department: user.profile?.program || undefined,
      yearOfStudy: user.profile?.yearOfStudy || undefined,
      gpa: user.profile?.gpa || undefined,
      isActive: user.isActive,
      emailVerified: true, // For now, assume all users are verified
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}