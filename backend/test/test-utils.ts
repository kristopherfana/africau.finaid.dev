import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export class TestUtils {
  public static async createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    
    // Enable global pipes and interceptors here if needed
    
    await app.init();
    return app;
  }

  public static async cleanDatabase(prisma: PrismaService): Promise<void> {
    // Clean up test data in reverse dependency order
    try {
      // Clean application-related tables first
      await prisma.applicationHistory.deleteMany();
      await prisma.applicationReview.deleteMany();
      await prisma.applicationDocument.deleteMany();
      await prisma.application.deleteMany();
    } catch (e) {
      console.log('Application tables not found, skipping...');
    }
    
    try {
      await prisma.document.deleteMany();
    } catch (e) {
      console.log('Document table not found, skipping...');
    }
    
    try {
      await prisma.scholarship.deleteMany();
    } catch (e) {
      console.log('Scholarship table not found, skipping...');
    }
    
    try {
      await prisma.profile.deleteMany();
    } catch (e) {
      console.log('Profile table not found, skipping...');
    }
    
    try {
      await prisma.sponsor.deleteMany();
    } catch (e) {
      console.log('Sponsor table not found, skipping...');
    }
    
    try {
      await prisma.user.deleteMany();
    } catch (e) {
      console.log('User table not found, skipping...');
    }
  }

  public static async createTestUser(
    prisma: PrismaService,
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: 'STUDENT' | 'ADMIN' | 'SPONSOR';
    }
  ) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: true,
      },
    });

    // Create profile for all users
    await prisma.profile.create({
      data: {
        userId: user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: '+1234567890',
        address: '123 Test St',
        nationality: 'Test Country',
        dateOfBirth: new Date('1995-01-01'),
        gender: 'MALE',
        ...(userData.role === 'STUDENT' && {
          studentId: `STU${Date.now()}`,
          program: 'Computer Science',
          level: 'UNDERGRADUATE',
          yearOfStudy: 2,
          gpa: 3.5,
        }),
      },
    });

    // Create sponsor organization if user is a sponsor
    if (userData.role === 'SPONSOR') {
      await prisma.sponsor.create({
        data: {
          name: 'Test Organization',
          type: 'ORGANIZATION',
          contactPerson: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          phone: '+1234567890',
          website: 'https://test.com',
          address: '123 Test St',
        },
      });
    }

    return user;
  }

  public static async createTestScholarship(
    prisma: PrismaService,
    sponsorUserId: string,
    scholarshipData?: Partial<{
      name: string;
      description: string;
      amount: number;
      totalSlots: number;
      availableSlots: number;
      applicationEndDate: Date;
    }>
  ) {
    // Find sponsor organization (not by userId)
    const sponsor = await prisma.sponsor.findFirst({
      where: { 
        email: {
          contains: sponsorUserId.includes('@') ? sponsorUserId : undefined
        }
      },
    });

    if (!sponsor) {
      // Create a sponsor if none exists
      const newSponsor = await prisma.sponsor.create({
        data: {
          name: 'Test Sponsor Org',
          type: 'ORGANIZATION',
          contactPerson: 'Test Contact',
          email: 'test@sponsor.com',
          phone: '+1234567890',
          address: 'Test Address',
        },
      });
      
      return await prisma.scholarship.create({
        data: {
          sponsorId: newSponsor.id,
          name: scholarshipData?.name || 'Test Scholarship',
          description: scholarshipData?.description || 'Test scholarship description',
          amount: scholarshipData?.amount || 10000,
          currency: 'USD',
          totalSlots: scholarshipData?.totalSlots || 5,
          availableSlots: scholarshipData?.availableSlots || 5,
          applicationStartDate: new Date(),
          applicationEndDate: scholarshipData?.applicationEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          academicYear: '2025-2026',
          durationMonths: 12,
          disbursementSchedule: 'SEMESTER',
          status: 'ACTIVE',
        },
      });
    }

    return await prisma.scholarship.create({
      data: {
        sponsorId: sponsor.id,
        name: scholarshipData?.name || 'Test Scholarship',
        description: scholarshipData?.description || 'Test scholarship description',
        amount: scholarshipData?.amount || 10000,
        currency: 'USD',
        totalSlots: scholarshipData?.totalSlots || 5,
        availableSlots: scholarshipData?.availableSlots || 5,
        applicationStartDate: new Date(),
        applicationEndDate: scholarshipData?.applicationEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        academicYear: '2025-2026',
        durationMonths: 12,
        disbursementSchedule: 'SEMESTER',
        status: 'ACTIVE',
      },
    });
  }

  public static async createTestApplication(
    prisma: PrismaService,
    studentUserId: string,
    scholarshipId: string,
    applicationData?: Partial<{
      status: string;
      personalStatement: string;
      gpa: number;
    }>
  ) {
    try {
      const applicationCount = await prisma.application.count();
      const applicationNumber = `APP-${Date.now()}-${applicationCount + 1}`;

      return await prisma.application.create({
        data: {
          applicationNumber,
          userId: studentUserId,
          scholarshipId,
          status: applicationData?.status || 'DRAFT',
          motivationLetter: applicationData?.personalStatement || 'Test personal statement',
          submittedAt: applicationData?.status === 'SUBMITTED' || applicationData?.status === 'UNDER_REVIEW' 
            ? new Date() 
            : null,
        },
      });
    } catch (error) {
      console.warn('Application model not available yet, skipping application creation');
      return null;
    }
  }

  public static generateAuthToken(): string {
    // Mock JWT token for testing
    return 'Bearer mock-jwt-token';
  }

  public static createMockUser(role: 'STUDENT' | 'ADMIN' | 'SPONSOR' = 'STUDENT') {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}