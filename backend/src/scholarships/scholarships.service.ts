import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScholarshipDto, ScholarshipStatus } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { ScholarshipResponseDto } from './dto/scholarship-response.dto';

@Injectable()
export class ScholarshipsService {
  constructor(private prisma: PrismaService) {}

  async create(createScholarshipDto: any): Promise<ScholarshipResponseDto> {
    // Handle both DTO and test data formats
    const sponsorName = createScholarshipDto.sponsor || 'Test Sponsor Organization';
    
    // For now, create with a default sponsor - you might want to pass sponsorId from the DTO
    let defaultSponsor = await this.prisma.sponsor.findFirst();
    
    if (!defaultSponsor) {
      // Create a default sponsor if none exists
      defaultSponsor = await this.prisma.sponsor.create({
        data: {
          name: sponsorName,
          type: 'ORGANIZATION'
        }
      });
    }

    // Handle different field naming between DTO and test data
    const totalSlots = createScholarshipDto.totalSlots || createScholarshipDto.maxRecipients || 5;
    const availableSlots = createScholarshipDto.availableSlots || createScholarshipDto.maxRecipients || totalSlots;
    
    // Handle both YYYY-MM-DD and ISO date formats
    let applicationStartDate = createScholarshipDto.applicationStartDate || new Date();
    let applicationEndDate = createScholarshipDto.applicationEndDate || createScholarshipDto.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    if (typeof applicationStartDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(applicationStartDate)) {
      applicationStartDate = new Date(applicationStartDate + 'T00:00:00.000Z');
    }
    if (typeof applicationEndDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(applicationEndDate)) {
      applicationEndDate = new Date(applicationEndDate + 'T23:59:59.999Z');
    }

    const scholarship = await this.prisma.scholarship.create({
      data: {
        name: createScholarshipDto.name,
        description: createScholarshipDto.description || '',
        amount: createScholarshipDto.amount,
        totalSlots: totalSlots,
        availableSlots: availableSlots,
        applicationStartDate: applicationStartDate,
        applicationEndDate: applicationEndDate,
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        durationMonths: 12,
        disbursementSchedule: 'ANNUAL',
        status: createScholarshipDto.status === 'OPEN' || createScholarshipDto.status === ScholarshipStatus.OPEN ? 'ACTIVE' : 
               createScholarshipDto.status === 'CLOSED' || createScholarshipDto.status === ScholarshipStatus.CLOSED ? 'INACTIVE' : 'DRAFT',
        sponsorId: defaultSponsor.id
      },
      include: {
        sponsor: true,
        applications: true
      }
    });

    // Create eligibility criteria if provided
    if (createScholarshipDto.eligibilityCriteria && Array.isArray(createScholarshipDto.eligibilityCriteria)) {
      for (const criteria of createScholarshipDto.eligibilityCriteria) {
        await this.prisma.scholarshipCriteria.create({
          data: {
            scholarshipId: scholarship.id,
            criteriaType: 'GENERAL',
            criteriaValue: criteria,
            isMandatory: true
          }
        });
      }
    }

    return this.mapToResponseDto(scholarship);
  }

  async findAll(filters: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ScholarshipResponseDto[]> {
    const where: any = {};
    
    if (filters.status) {
      const statusMapping = {
        'OPEN': 'ACTIVE',
        'CLOSED': 'INACTIVE',
        'SUSPENDED': 'DRAFT'
      };
      where.status = statusMapping[filters.status] || filters.status;
    }

    const scholarships = await this.prisma.scholarship.findMany({
      where,
      include: {
        sponsor: true,
        applications: true,
        criteria: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined,
      take: filters.limit,
    });

    return scholarships.map(scholarship => this.mapToResponseDto(scholarship));
  }

  async findOne(id: string): Promise<ScholarshipResponseDto> {
    const scholarship = await this.prisma.scholarship.findUnique({
      where: { id },
      include: {
        sponsor: true,
        applications: true,
        criteria: true
      }
    });

    if (!scholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    return this.mapToResponseDto(scholarship);
  }

  async update(id: string, updateScholarshipDto: UpdateScholarshipDto): Promise<ScholarshipResponseDto> {
    const existingScholarship = await this.prisma.scholarship.findUnique({
      where: { id }
    });

    if (!existingScholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    const updateData: any = {};
    
    if (updateScholarshipDto.name) updateData.name = updateScholarshipDto.name;
    if (updateScholarshipDto.description) updateData.description = updateScholarshipDto.description;
    if (updateScholarshipDto.amount) updateData.amount = updateScholarshipDto.amount;
    if (updateScholarshipDto.maxRecipients) {
      updateData.totalSlots = updateScholarshipDto.maxRecipients;
      updateData.availableSlots = updateScholarshipDto.maxRecipients;
    }
    if (updateScholarshipDto.applicationStartDate) {
      // Handle both YYYY-MM-DD and ISO formats
      const startDate = typeof updateScholarshipDto.applicationStartDate === 'string'
        ? (/^\d{4}-\d{2}-\d{2}$/.test(updateScholarshipDto.applicationStartDate)
          ? new Date(updateScholarshipDto.applicationStartDate + 'T00:00:00.000Z')
          : new Date(updateScholarshipDto.applicationStartDate))
        : updateScholarshipDto.applicationStartDate;
      updateData.applicationStartDate = startDate;
    }
    if (updateScholarshipDto.applicationDeadline) {
      // Handle both YYYY-MM-DD and ISO formats
      const endDate = typeof updateScholarshipDto.applicationDeadline === 'string'
        ? (/^\d{4}-\d{2}-\d{2}$/.test(updateScholarshipDto.applicationDeadline)
          ? new Date(updateScholarshipDto.applicationDeadline + 'T23:59:59.999Z')
          : new Date(updateScholarshipDto.applicationDeadline))
        : updateScholarshipDto.applicationDeadline;
      updateData.applicationEndDate = endDate;
    }
    if (updateScholarshipDto.status) {
      const statusMapping = {
        [ScholarshipStatus.OPEN]: 'ACTIVE',
        [ScholarshipStatus.CLOSED]: 'INACTIVE',
        [ScholarshipStatus.SUSPENDED]: 'DRAFT'
      };
      updateData.status = statusMapping[updateScholarshipDto.status] || 'DRAFT';
    }

    const scholarship = await this.prisma.scholarship.update({
      where: { id },
      data: updateData,
      include: {
        sponsor: true,
        applications: true,
        criteria: true
      }
    });

    return this.mapToResponseDto(scholarship);
  }

  async remove(id: string): Promise<void> {
    const scholarship = await this.prisma.scholarship.findUnique({
      where: { id },
      include: {
        applications: true,
        criteria: true
      }
    });

    if (!scholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    // Delete related records first to avoid foreign key constraints
    
    // Delete scholarship criteria
    await this.prisma.scholarshipCriteria.deleteMany({
      where: { scholarshipId: id }
    });

    // Delete applications and related data
    if (scholarship.applications && scholarship.applications.length > 0) {
      for (const application of scholarship.applications) {
        // Delete application documents
        await this.prisma.applicationDocument.deleteMany({
          where: { applicationId: application.id }
        });
        
        // Delete application reviews
        await this.prisma.applicationReview.deleteMany({
          where: { applicationId: application.id }
        });
        
        // Delete application history
        await this.prisma.applicationHistory.deleteMany({
          where: { applicationId: application.id }
        });
      }
      
      // Delete applications
      await this.prisma.application.deleteMany({
        where: { scholarshipId: id }
      });
    }

    // Finally delete the scholarship
    await this.prisma.scholarship.delete({
      where: { id }
    });
  }

  private mapToResponseDto(scholarship: any): ScholarshipResponseDto {
    const statusMapping = {
      'ACTIVE': ScholarshipStatus.OPEN,
      'INACTIVE': ScholarshipStatus.CLOSED,
      'DRAFT': ScholarshipStatus.SUSPENDED
    };

    return {
      id: scholarship.id,
      name: scholarship.name,
      description: scholarship.description || '',
      amount: scholarship.amount,
      sponsor: scholarship.sponsor?.name || 'Unknown Sponsor',
      type: scholarship.type || 'FULL', // Default type since schema doesn't have this field
      applicationStartDate: scholarship.applicationStartDate,
      applicationDeadline: scholarship.applicationEndDate,
      eligibilityCriteria: scholarship.criteria?.map((c: any) => c.criteriaValue) || [],
      maxRecipients: scholarship.totalSlots,
      currentApplications: scholarship.applications?.length || 0,
      status: statusMapping[scholarship.status] || ScholarshipStatus.SUSPENDED,
      createdAt: scholarship.createdAt,
      updatedAt: scholarship.updatedAt
    };
  }
}
