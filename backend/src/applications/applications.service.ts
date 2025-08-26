import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateApplicationDto, ApplicationStatus } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';

@Injectable()
export class ApplicationsService {
  // Mock data - replace with actual database implementation
  private applications: ApplicationResponseDto[] = [];

  async create(createApplicationDto: CreateApplicationDto): Promise<ApplicationResponseDto> {
    const application: ApplicationResponseDto = {
      id: Math.random().toString(36).substr(2, 9),
      ...createApplicationDto,
      scholarshipName: 'Excellence Scholarship 2024', // Mock data
      applicantName: 'John Doe', // Mock data
      applicantEmail: 'student@africau.edu', // Mock data
      academicInfo: createApplicationDto.academicInfo || {},
      financialInfo: createApplicationDto.financialInfo || {},
      documentIds: createApplicationDto.documentIds || [],
      personalStatement: createApplicationDto.personalStatement || '',
      status: createApplicationDto.status || ApplicationStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.applications.push(application);
    return application;
  }

  async findAll(filters: {
    status?: string;
    scholarshipId?: string;
    applicantId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApplicationResponseDto[]> {
    // TODO: Implement filtering and pagination
    return this.applications;
  }

  async findByApplicant(applicantId: string): Promise<ApplicationResponseDto[]> {
    return this.applications.filter(app => app.applicantId === applicantId);
  }

  async findOne(id: string): Promise<ApplicationResponseDto> {
    const application = this.applications.find(app => app.id === id);
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<ApplicationResponseDto> {
    const index = this.applications.findIndex(app => app.id === id);
    if (index === -1) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    this.applications[index] = {
      ...this.applications[index],
      ...updateApplicationDto,
      updatedAt: new Date(),
    };

    return this.applications[index];
  }

  async submit(id: string): Promise<ApplicationResponseDto> {
    const application = await this.findOne(id);
    
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException('Only draft applications can be submitted');
    }

    application.status = ApplicationStatus.SUBMITTED;
    application.submittedAt = new Date();
    application.updatedAt = new Date();

    return application;
  }

  async review(id: string, reviewData: { status: string; comments?: string }): Promise<ApplicationResponseDto> {
    const application = await this.findOne(id);
    
    if (application.status !== ApplicationStatus.SUBMITTED && application.status !== ApplicationStatus.UNDER_REVIEW) {
      throw new BadRequestException('Application cannot be reviewed in its current status');
    }

    application.status = reviewData.status as ApplicationStatus;
    application.reviewComments = reviewData.comments;
    application.reviewedBy = 'Admin User'; // Mock - should get from JWT
    application.updatedAt = new Date();

    return application;
  }

  async withdraw(id: string): Promise<ApplicationResponseDto> {
    const application = await this.findOne(id);
    
    if (application.status === ApplicationStatus.APPROVED || application.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException('Cannot withdraw an already processed application');
    }

    application.status = ApplicationStatus.WITHDRAWN;
    application.updatedAt = new Date();

    return application;
  }

  async remove(id: string): Promise<void> {
    const index = this.applications.findIndex(app => app.id === id);
    if (index === -1) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    this.applications.splice(index, 1);
  }
}
