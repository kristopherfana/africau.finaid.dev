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
    if (createUserDto.role === UserRole.STUDENT && createUserDto.studentProfile?.studentId) {
      const existingStudentId = await this.prisma.studentProfile.findUnique({
        where: {
          studentId: createUserDto.studentProfile.studentId,
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

    // Create user with base profile first
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
          },
        },
      },
      include: { profile: true },
    });

    // Create role-specific profile based on user role
    await this.createRoleSpecificProfile(user.profile.id, createUserDto);

    // Fetch user with all profile data
    const userWithProfiles = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: {
          include: {
            studentProfile: true,
            reviewerProfile: true,
            adminProfile: true,
            sponsorProfile: true,
          },
        },
      },
    });

    return this.mapToUserResponse(userWithProfiles);
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
        studentProfile: {
          program: { contains: filters.department },
        },
      };
    }

    const skip = filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined;
    const take = filters.limit || undefined;

    const users = await this.prisma.user.findMany({
      where,
      include: {
        profile: {
          include: {
            studentProfile: true,
            reviewerProfile: true,
            adminProfile: true,
            sponsorProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    return users.map(user => this.mapToUserResponse(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            studentProfile: true,
            reviewerProfile: true,
            adminProfile: true,
            sponsorProfile: true,
          },
        },
      },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return this.mapToUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            studentProfile: true,
            reviewerProfile: true,
            adminProfile: true,
            sponsorProfile: true,
          },
        },
      },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Update base profile
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
            nationality: (updateUserDto as any).nationality,
            address: (updateUserDto as any).address,
          },
        },
      },
      include: {
        profile: {
          include: {
            studentProfile: true,
            reviewerProfile: true,
            adminProfile: true,
            sponsorProfile: true,
          },
        },
      },
    });

    // Update role-specific profile data
    await this.updateRoleSpecificProfile(user.profile.id, user.role as UserRole, updateUserDto);

    // Fetch updated user with all profile data
    const finalUser = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            studentProfile: true,
            reviewerProfile: true,
            adminProfile: true,
            sponsorProfile: true,
          },
        },
      },
    });

    return this.mapToUserResponse(finalUser);
  }

  async activate(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        profile: {
          include: {
            studentProfile: true,
            reviewerProfile: true,
            adminProfile: true,
            sponsorProfile: true,
          },
        },
      },
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
      include: {
        profile: {
          include: {
            studentProfile: true,
            reviewerProfile: true,
            adminProfile: true,
            sponsorProfile: true,
          },
        },
      },
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

  private async updateRoleSpecificProfile(profileId: string, userRole: UserRole, updateUserDto: UpdateUserDto): Promise<void> {
    switch (userRole) {
      case UserRole.STUDENT:
        if ((updateUserDto as any).studentProfile) {
          const studentData = (updateUserDto as any).studentProfile;
          
          // First, check if student profile exists
          const existingProfile = await this.prisma.studentProfile.findUnique({
            where: { profileId },
          });

          if (existingProfile) {
            // Update existing student profile
            await this.prisma.studentProfile.update({
              where: { profileId },
              data: {
                studentId: studentData.studentId || existingProfile.studentId,
                program: studentData.program || existingProfile.program,
                level: studentData.level || existingProfile.level,
                yearOfStudy: studentData.yearOfStudy ?? existingProfile.yearOfStudy,
                gpa: studentData.gpa ?? existingProfile.gpa,
                expectedGraduation: studentData.expectedGraduation ? new Date(studentData.expectedGraduation) : existingProfile.expectedGraduation,
              },
            });
          } else {
            // Create new student profile if it doesn't exist
            await this.prisma.studentProfile.create({
              data: {
                profileId,
                studentId: studentData.studentId || '',
                program: studentData.program || '',
                level: studentData.level || 'UNDERGRADUATE',
                yearOfStudy: studentData.yearOfStudy || 1,
                gpa: studentData.gpa,
                expectedGraduation: studentData.expectedGraduation ? new Date(studentData.expectedGraduation) : undefined,
              },
            });
          }
        }
        break;

      case UserRole.REVIEWER:
        if ((updateUserDto as any).reviewerProfile) {
          const reviewerData = (updateUserDto as any).reviewerProfile;
          
          const existingProfile = await this.prisma.reviewerProfile.findUnique({
            where: { profileId },
          });

          if (existingProfile) {
            await this.prisma.reviewerProfile.update({
              where: { profileId },
              data: {
                expertiseAreas: reviewerData.expertiseAreas ? JSON.stringify(reviewerData.expertiseAreas) : existingProfile.expertiseAreas,
                department: reviewerData.department ?? existingProfile.department,
                yearsExperience: reviewerData.yearsExperience ?? existingProfile.yearsExperience,
                certifications: reviewerData.certifications ? JSON.stringify(reviewerData.certifications) : existingProfile.certifications,
                reviewQuota: reviewerData.reviewQuota ?? existingProfile.reviewQuota,
                isActive: reviewerData.isActive ?? existingProfile.isActive,
              },
            });
          } else {
            await this.prisma.reviewerProfile.create({
              data: {
                profileId,
                expertiseAreas: reviewerData.expertiseAreas ? JSON.stringify(reviewerData.expertiseAreas) : JSON.stringify([]),
                department: reviewerData.department,
                yearsExperience: reviewerData.yearsExperience,
                certifications: reviewerData.certifications ? JSON.stringify(reviewerData.certifications) : undefined,
                reviewQuota: reviewerData.reviewQuota || 10,
                isActive: reviewerData.isActive ?? true,
              },
            });
          }
        }
        break;

      case UserRole.ADMIN:
        if ((updateUserDto as any).adminProfile) {
          const adminData = (updateUserDto as any).adminProfile;
          
          const existingProfile = await this.prisma.adminProfile.findUnique({
            where: { profileId },
          });

          if (existingProfile) {
            await this.prisma.adminProfile.update({
              where: { profileId },
              data: {
                permissions: adminData.permissions ? JSON.stringify(adminData.permissions) : existingProfile.permissions,
                managedDepartments: adminData.managedDepartments ? JSON.stringify(adminData.managedDepartments) : existingProfile.managedDepartments,
                accessLevel: adminData.accessLevel || existingProfile.accessLevel,
                lastLogin: adminData.lastLogin ? new Date(adminData.lastLogin) : existingProfile.lastLogin,
              },
            });
          } else {
            await this.prisma.adminProfile.create({
              data: {
                profileId,
                permissions: adminData.permissions ? JSON.stringify(adminData.permissions) : JSON.stringify([]),
                managedDepartments: adminData.managedDepartments ? JSON.stringify(adminData.managedDepartments) : undefined,
                accessLevel: adminData.accessLevel || 'STANDARD',
                lastLogin: adminData.lastLogin ? new Date(adminData.lastLogin) : undefined,
              },
            });
          }
        }
        break;

      case UserRole.SPONSOR:
        if ((updateUserDto as any).sponsorProfile) {
          const sponsorData = (updateUserDto as any).sponsorProfile;
          
          const existingProfile = await this.prisma.sponsorProfile.findUnique({
            where: { profileId },
          });

          if (existingProfile) {
            await this.prisma.sponsorProfile.update({
              where: { profileId },
              data: {
                organizationName: sponsorData.organizationName ?? existingProfile.organizationName,
                position: sponsorData.position ?? existingProfile.position,
                sponsorType: sponsorData.sponsorType || existingProfile.sponsorType,
                totalContributed: sponsorData.totalContributed ?? existingProfile.totalContributed,
                preferredCauses: sponsorData.preferredCauses ? JSON.stringify(sponsorData.preferredCauses) : existingProfile.preferredCauses,
                isVerified: sponsorData.isVerified ?? existingProfile.isVerified,
              },
            });
          } else {
            await this.prisma.sponsorProfile.create({
              data: {
                profileId,
                organizationName: sponsorData.organizationName,
                position: sponsorData.position,
                sponsorType: sponsorData.sponsorType || 'INDIVIDUAL',
                totalContributed: sponsorData.totalContributed || 0,
                preferredCauses: sponsorData.preferredCauses ? JSON.stringify(sponsorData.preferredCauses) : undefined,
                isVerified: sponsorData.isVerified ?? false,
              },
            });
          }
        }
        break;

      default:
        // No role-specific updates needed for other roles
        break;
    }
  }

  private async createRoleSpecificProfile(profileId: string, createUserDto: CreateUserDto): Promise<void> {
    switch (createUserDto.role) {
      case UserRole.STUDENT:
        if (!createUserDto.studentProfile) {
          throw new BadRequestException('Student profile data is required for STUDENT role');
        }
        await this.prisma.studentProfile.create({
          data: {
            profileId,
            studentId: createUserDto.studentProfile.studentId,
            program: createUserDto.studentProfile.program,
            level: createUserDto.studentProfile.level,
            yearOfStudy: createUserDto.studentProfile.yearOfStudy,
            gpa: createUserDto.studentProfile.gpa,
            institution: createUserDto.studentProfile.institution,
            expectedGraduation: createUserDto.studentProfile.expectedGraduation ? new Date(createUserDto.studentProfile.expectedGraduation) : undefined,
          },
        });
        break;

      case UserRole.REVIEWER:
        if (!createUserDto.reviewerProfile) {
          throw new BadRequestException('Reviewer profile data is required for REVIEWER role');
        }
        await this.prisma.reviewerProfile.create({
          data: {
            profileId,
            expertiseAreas: JSON.stringify(createUserDto.reviewerProfile.expertiseAreas),
            department: createUserDto.reviewerProfile.department,
            yearsExperience: createUserDto.reviewerProfile.yearsExperience,
            certifications: createUserDto.reviewerProfile.certifications ? JSON.stringify(createUserDto.reviewerProfile.certifications) : undefined,
            reviewQuota: createUserDto.reviewerProfile.reviewQuota || 10,
            isActive: createUserDto.reviewerProfile.isActive ?? true,
          },
        });
        break;

      case UserRole.ADMIN:
        if (!createUserDto.adminProfile) {
          throw new BadRequestException('Admin profile data is required for ADMIN role');
        }
        await this.prisma.adminProfile.create({
          data: {
            profileId,
            permissions: JSON.stringify(createUserDto.adminProfile.permissions),
            managedDepartments: createUserDto.adminProfile.managedDepartments ? JSON.stringify(createUserDto.adminProfile.managedDepartments) : undefined,
            accessLevel: createUserDto.adminProfile.accessLevel || 'STANDARD',
            lastLogin: createUserDto.adminProfile.lastLogin ? new Date(createUserDto.adminProfile.lastLogin) : undefined,
          },
        });
        break;

      case UserRole.SPONSOR:
        if (!createUserDto.sponsorProfile) {
          throw new BadRequestException('Sponsor profile data is required for SPONSOR role');
        }
        await this.prisma.sponsorProfile.create({
          data: {
            profileId,
            organizationName: createUserDto.sponsorProfile.organizationName,
            position: createUserDto.sponsorProfile.position,
            sponsorType: createUserDto.sponsorProfile.sponsorType || 'INDIVIDUAL',
            totalContributed: createUserDto.sponsorProfile.totalContributed || 0,
            preferredCauses: createUserDto.sponsorProfile.preferredCauses ? JSON.stringify(createUserDto.sponsorProfile.preferredCauses) : undefined,
            isVerified: createUserDto.sponsorProfile.isVerified ?? false,
          },
        });
        break;

      default:
        throw new BadRequestException(`Invalid user role: ${createUserDto.role}`);
    }
  }

  private mapToUserResponse(user: any): UserResponseDto {
    const response: UserResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      phoneNumber: user.profile?.phone || undefined,
      gender: user.profile?.gender || undefined,
      dateOfBirth: user.profile?.dateOfBirth || undefined,
      nationality: user.profile?.nationality || undefined,
      address: user.profile?.address || undefined,
      role: user.role as UserRole,
      isActive: user.isActive,
      emailVerified: true, // For now, assume all users are verified
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Add role-specific profile data
    if (user.profile?.studentProfile) {
      response.studentProfile = {
        studentId: user.profile.studentProfile.studentId,
        program: user.profile.studentProfile.program,
        level: user.profile.studentProfile.level,
        yearOfStudy: user.profile.studentProfile.yearOfStudy,
        gpa: user.profile.studentProfile.gpa,
        institution: user.profile.studentProfile.institution,
        expectedGraduation: user.profile.studentProfile.expectedGraduation?.toISOString(),
      };
    }

    if (user.profile?.reviewerProfile) {
      response.reviewerProfile = {
        expertiseAreas: JSON.parse(user.profile.reviewerProfile.expertiseAreas || '[]'),
        department: user.profile.reviewerProfile.department,
        yearsExperience: user.profile.reviewerProfile.yearsExperience,
        certifications: user.profile.reviewerProfile.certifications ? JSON.parse(user.profile.reviewerProfile.certifications) : undefined,
        reviewQuota: user.profile.reviewerProfile.reviewQuota,
        isActive: user.profile.reviewerProfile.isActive,
      };
    }

    if (user.profile?.adminProfile) {
      response.adminProfile = {
        permissions: JSON.parse(user.profile.adminProfile.permissions || '[]'),
        managedDepartments: user.profile.adminProfile.managedDepartments ? JSON.parse(user.profile.adminProfile.managedDepartments) : undefined,
        accessLevel: user.profile.adminProfile.accessLevel,
        lastLogin: user.profile.adminProfile.lastLogin?.toISOString(),
      };
    }

    if (user.profile?.sponsorProfile) {
      response.sponsorProfile = {
        organizationName: user.profile.sponsorProfile.organizationName,
        position: user.profile.sponsorProfile.position,
        sponsorType: user.profile.sponsorProfile.sponsorType,
        totalContributed: user.profile.sponsorProfile.totalContributed,
        preferredCauses: user.profile.sponsorProfile.preferredCauses ? JSON.parse(user.profile.sponsorProfile.preferredCauses) : undefined,
        isVerified: user.profile.sponsorProfile.isVerified,
      };
    }

    return response;
  }
}