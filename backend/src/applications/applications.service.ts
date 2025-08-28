import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateApplicationDto, ApplicationStatus } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto, currentUserId?: string): Promise<ApplicationResponseDto> {
    // Generate unique application number
    const applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Use provided applicantId or currentUserId as fallback
    const applicantId = createApplicationDto.applicantId || currentUserId;
    
    // Validate required fields
    if (!applicantId) {
      throw new BadRequestException('Applicant ID is required');
    }
    if (!createApplicationDto.scholarshipId) {
      throw new BadRequestException('Scholarship ID is required');
    }

    // Create application in database
    const application = await this.prisma.application.create({
      data: {
        applicationNumber,
        userId: applicantId,
        scholarshipId: createApplicationDto.scholarshipId,
        motivationLetter: createApplicationDto.personalStatement || (createApplicationDto as any).motivationLetter || '',
        additionalInfo: JSON.stringify({
          academicInfo: createApplicationDto.academicInfo || {},
          financialInfo: createApplicationDto.financialInfo || {},
        }),
        status: createApplicationDto.status || ApplicationStatus.DRAFT,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        scholarship: true,
      },
    });

    // Link documents if provided
    if (createApplicationDto.documentIds?.length) {
      await Promise.all(
        createApplicationDto.documentIds.map((documentId) =>
          this.prisma.applicationDocument.create({
            data: {
              applicationId: application.id,
              documentId,
              isRequired: true,
            },
          })
        )
      );
    }

    return this.mapToResponseDto(application);
  }

  async findAll(filters: {
    status?: string;
    scholarshipId?: string;
    applicantId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApplicationResponseDto[]> {
    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.scholarshipId) {
      where.scholarshipId = filters.scholarshipId;
    }
    if (filters.applicantId) {
      where.userId = filters.applicantId;
    }

    const applications = await this.prisma.application.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        scholarship: true,
        documents: {
          include: {
            document: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined,
      take: filters.limit,
    });

    return applications.map(app => this.mapToResponseDto(app));
  }

  async findByApplicant(applicantId: string): Promise<ApplicationResponseDto[]> {
    const applications = await this.prisma.application.findMany({
      where: { userId: applicantId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        scholarship: true,
        documents: {
          include: {
            document: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return applications.map(app => this.mapToResponseDto(app));
  }

  async findOne(id: string): Promise<ApplicationResponseDto> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        scholarship: true,
        documents: {
          include: {
            document: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return this.mapToResponseDto(application);
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<ApplicationResponseDto> {
    const existingApp = await this.prisma.application.findUnique({ where: { id } });
    if (!existingApp) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const additionalInfo = existingApp.additionalInfo ? JSON.parse(existingApp.additionalInfo) : {};
    
    const updatedApp = await this.prisma.application.update({
      where: { id },
      data: {
        motivationLetter: updateApplicationDto.personalStatement ?? undefined,
        additionalInfo: JSON.stringify({
          ...additionalInfo,
          academicInfo: updateApplicationDto.academicInfo ?? additionalInfo.academicInfo,
          financialInfo: updateApplicationDto.financialInfo ?? additionalInfo.financialInfo,
        }),
        status: updateApplicationDto.status ?? undefined,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        scholarship: true,
        documents: {
          include: {
            document: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedApp);
  }

  async submit(id: string): Promise<ApplicationResponseDto> {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException('Only draft applications can be submitted');
    }

    const updatedApp = await this.prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        scholarship: true,
        documents: {
          include: {
            document: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedApp);
  }

  async review(id: string, reviewData: { status: string; comments?: string }): Promise<ApplicationResponseDto> {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    
    if (application.status !== ApplicationStatus.SUBMITTED && application.status !== ApplicationStatus.UNDER_REVIEW) {
      throw new BadRequestException('Application cannot be reviewed in its current status');
    }

    const updatedApp = await this.prisma.application.update({
      where: { id },
      data: {
        status: reviewData.status,
        decisionNotes: reviewData.comments,
        reviewedAt: new Date(),
        decisionAt: new Date(),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        scholarship: true,
        documents: {
          include: {
            document: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedApp);
  }

  async withdraw(id: string): Promise<ApplicationResponseDto> {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    
    if (application.status === ApplicationStatus.APPROVED || application.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException('Cannot withdraw an already processed application');
    }

    const updatedApp = await this.prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.WITHDRAWN,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        scholarship: true,
        documents: {
          include: {
            document: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedApp);
  }

  async remove(id: string): Promise<void> {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    
    await this.prisma.application.delete({ where: { id } });
  }

  async findAnyStudentUser() {
    return this.prisma.user.findFirst({
      where: { role: 'STUDENT', isActive: true }
    });
  }

  private mapToResponseDto(application: any): any {
    const additionalInfo = application.additionalInfo ? JSON.parse(application.additionalInfo) : {};
    const fullName = application.user.profile 
      ? `${application.user.profile.firstName} ${application.user.profile.lastName}`.trim()
      : application.user.email;

    // Return both DTO format and test-expected format for compatibility
    return {
      id: application.id,
      applicationNumber: application.applicationNumber, // For test compatibility
      scholarshipId: application.scholarshipId,
      scholarshipName: application.scholarship.name,
      applicantId: application.userId,
      userId: application.userId, // For test compatibility
      applicantName: fullName,
      applicantEmail: application.user.email,
      personalStatement: application.motivationLetter || '',
      motivationLetter: application.motivationLetter || '', // For test compatibility
      academicInfo: additionalInfo.academicInfo || {},
      financialInfo: additionalInfo.financialInfo || {},
      documentIds: application.documents?.map((ad: any) => ad.documentId) || [],
      status: application.status as ApplicationStatus,
      reviewComments: application.decisionNotes,
      reviewedBy: application.decisionBy,
      submittedAt: application.submittedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
