import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  // Mock data - replace with actual database implementation
  private users: UserResponseDto[] = [
    {
      id: 'current-user-id',
      email: 'john.doe@africau.edu',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+263771234567',
      studentId: 'ST2024001',
      role: UserRole.STUDENT,
      department: 'Computer Science',
      yearOfStudy: 3,
      gpa: 3.75,
      isActive: true,
      emailVerified: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      email: 'jane.smith@africau.edu',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+263771234568',
      studentId: 'ST2024002',
      role: UserRole.STUDENT,
      department: 'Engineering',
      yearOfStudy: 2,
      gpa: 3.85,
      isActive: true,
      emailVerified: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-16'),
    },
    {
      id: '3',
      email: 'admin@africau.edu',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      department: 'Administration',
      isActive: true,
      emailVerified: true,
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: '4',
      email: 'sponsor@example.com',
      firstName: 'Corporate',
      lastName: 'Sponsor',
      role: UserRole.SPONSOR,
      isActive: true,
      emailVerified: true,
      createdAt: new Date('2023-11-15'),
      updatedAt: new Date('2024-01-05'),
    },
  ];

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = this.users.find(user => user.email === createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if student ID already exists (for students)
    if (createUserDto.studentId) {
      const existingStudentId = this.users.find(user => user.studentId === createUserDto.studentId);
      if (existingStudentId) {
        throw new ConflictException('Student ID already exists');
      }
    }

    const newUser: UserResponseDto = {
      id: Math.random().toString(36).substr(2, 9),
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phoneNumber: createUserDto.phoneNumber,
      gender: createUserDto.gender,
      dateOfBirth: createUserDto.dateOfBirth,
      studentId: createUserDto.studentId,
      role: createUserDto.role,
      department: createUserDto.department,
      yearOfStudy: createUserDto.yearOfStudy,
      gpa: createUserDto.gpa,
      isActive: true,
      emailVerified: false, // Default to false, requires email verification
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  async findAll(filters: {
    role?: string;
    department?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UserResponseDto[]> {
    let filtered = [...this.users];

    // Apply filters
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.department) {
      filtered = filtered.filter(user => user.department === filters.department);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(user => user.isActive === filters.isActive);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    if (filters.page && filters.limit) {
      const startIndex = (filters.page - 1) * filters.limit;
      filtered = filtered.slice(startIndex, startIndex + filters.limit);
    }

    return filtered;
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Email cannot be updated through this method since it's omitted from UpdateUserDto

    // Check for student ID conflicts if student ID is being updated
    if (updateUserDto.studentId && updateUserDto.studentId !== this.users[userIndex].studentId) {
      const studentIdExists = this.users.find(user => user.studentId === updateUserDto.studentId && user.id !== id);
      if (studentIdExists) {
        throw new ConflictException('Student ID already exists');
      }
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    return this.users[userIndex];
  }

  async activate(id: string): Promise<UserResponseDto> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users[userIndex].isActive = true;
    this.users[userIndex].updatedAt = new Date();

    return this.users[userIndex];
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users[userIndex].isActive = false;
    this.users[userIndex].updatedAt = new Date();

    return this.users[userIndex];
  }

  async verifyEmail(id: string): Promise<UserResponseDto> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users[userIndex].emailVerified = true;
    this.users[userIndex].updatedAt = new Date();

    return this.users[userIndex];
  }

  async changePassword(
    id: string,
    passwordData: { currentPassword: string; newPassword: string }
  ): Promise<{ message: string }> {
    const user = await this.findOne(id);

    // In real implementation, verify current password hash
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      throw new BadRequestException('Both current and new passwords are required');
    }

    if (passwordData.newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    // In real implementation, hash and store new password
    // For mock purposes, just return success message
    
    return { message: 'Password changed successfully' };
  }

  async remove(id: string): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // In real implementation, consider soft delete or check for dependencies
    this.users.splice(userIndex, 1);
  }

  async getStatistics() {
    const totalUsers = this.users.length;
    const activeUsers = this.users.filter(user => user.isActive).length;
    
    // Calculate users by role
    const byRole = {
      STUDENT: this.users.filter(user => user.role === UserRole.STUDENT).length,
      ADMIN: this.users.filter(user => user.role === UserRole.ADMIN).length,
      SPONSOR: this.users.filter(user => user.role === UserRole.SPONSOR).length,
      REVIEWER: this.users.filter(user => user.role === UserRole.REVIEWER).length,
    };

    // Calculate new users this month (mock)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newUsersThisMonth = this.users.filter(user => 
      user.createdAt >= thisMonth
    ).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      byRole,
      newUsersThisMonth,
      verifiedUsers: this.users.filter(user => user.emailVerified).length,
      unverifiedUsers: this.users.filter(user => !user.emailVerified).length,
    };
  }
}
