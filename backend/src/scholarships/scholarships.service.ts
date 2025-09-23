import { CreateScholarshipDto, ScholarshipStatus, ScholarshipType } from './dto/create-scholarship.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ScholarshipResponseDto } from './dto/scholarship-response.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';

@Injectable()
export class ScholarshipsService {
  constructor(private prisma: PrismaService) {}

  async create(createScholarshipDto: any): Promise<ScholarshipResponseDto> {
    // Handle both DTO and test data formats
    const sponsorName = createScholarshipDto.sponsor || 'Test Sponsor Organization';

    let sponsor;

    // Use provided sponsorId if available, otherwise fall back to default sponsor logic
    if (createScholarshipDto.sponsorId) {
      sponsor = await this.prisma.sponsor.findUnique({
        where: { id: createScholarshipDto.sponsorId }
      });

      if (!sponsor) {
        throw new NotFoundException(`Sponsor with ID ${createScholarshipDto.sponsorId} not found`);
      }
    } else {
      // Fallback: find any sponsor or create a default one
      sponsor = await this.prisma.sponsor.findFirst();

      if (!sponsor) {
        // Create a default sponsor if none exists
        sponsor = await this.prisma.sponsor.create({
          data: {
            name: sponsorName,
            type: 'ORGANIZATION'
          }
        });
      }
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

    // First, create or find a program for this cycle
    let program = await this.prisma.scholarshipProgram.findFirst({
      where: { name: createScholarshipDto.name }
    });

    if (!program) {
      program = await this.prisma.scholarshipProgram.create({
        data: {
          sponsorId: sponsor.id,
          name: createScholarshipDto.name,
          description: createScholarshipDto.description || '',
          startYear: new Date().getFullYear(),
          defaultAmount: createScholarshipDto.amount,
          defaultSlots: totalSlots,
        }
      });
    }

    const scholarship = await this.prisma.scholarshipCycle.create({
      data: {
        programId: program.id,
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        displayName: createScholarshipDto.name + ' ' + (new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)),
        amount: createScholarshipDto.amount,
        totalSlots: totalSlots,
        availableSlots: availableSlots,
        applicationStartDate: applicationStartDate,
        applicationEndDate: applicationEndDate,
        durationMonths: 12,
        disbursementSchedule: 'SEMESTER',
        status: 'ACTIVE', // Default to ACTIVE, actual status will be calculated dynamically based on dates
      },
      include: {
        program: {
          include: {
            sponsor: true
          }
        },
        applications: true
      }
    });

    // Create eligibility criteria if provided
    if (createScholarshipDto.eligibilityCriteria && Array.isArray(createScholarshipDto.eligibilityCriteria)) {
      for (const criteria of createScholarshipDto.eligibilityCriteria) {
        await this.prisma.scholarshipCycleCriteria.create({
          data: {
            cycleId: scholarship.id,
            criteriaType: 'GENERAL',
            criteriaValue: criteria,
            isMandatory: true
          }
        });
      }
    }

    // Create type criteria if provided
    if (createScholarshipDto.type) {
      await this.prisma.scholarshipCycleCriteria.create({
        data: {
          cycleId: scholarship.id,
          criteriaType: 'SCHOLARSHIP_TYPE',
          criteriaValue: createScholarshipDto.type,
          isMandatory: false
        }
      });
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

    // Filter programs based on their cycles' status if provided
    if (filters.status) {
      const statusMapping = {
        'OPEN': 'OPEN',
        'CLOSED': 'CLOSED',
        'SUSPENDED': 'SUSPENDED',
        'DRAFT': 'DRAFT'
      };
      const mappedStatus = statusMapping[filters.status] || filters.status;
      where.cycles = {
        some: {
          status: mappedStatus
        }
      };
    }

    const programs = await this.prisma.scholarshipProgram.findMany({
      where,
      include: {
        sponsor: true,
        cycles: {
          include: {
            applications: true,
            criteria: true
          },
          orderBy: {
            academicYear: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined,
      take: filters.limit,
    });

    return programs.map(program => this.mapProgramToResponseDto(program));
  }

  async findAllCycles(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ScholarshipResponseDto[], pagination: any }> {
    const where: any = {};

    // Filter cycles by status if provided
    if (filters.status) {
      const statusMapping = {
        'OPEN': 'OPEN',
        'CLOSED': 'CLOSED',
        'SUSPENDED': 'SUSPENDED',
        'DRAFT': 'DRAFT'
      };
      const mappedStatus = statusMapping[filters.status] || filters.status;
      where.status = mappedStatus;
    }

    // Get total count for pagination
    const total = await this.prisma.scholarshipCycle.count({ where });

    const cycles = await this.prisma.scholarshipCycle.findMany({
      where,
      include: {
        program: {
          include: {
            sponsor: true
          }
        },
        applications: true,
        criteria: true
      },
      orderBy: [
        { academicYear: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined,
      take: filters.limit,
    });

    const pageNum = filters.page || 1;
    const limitNum = filters.limit || 20;

    return {
      data: cycles.map(cycle => this.mapToResponseDto(cycle)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async findOne(id: string): Promise<ScholarshipResponseDto> {
    const program = await this.prisma.scholarshipProgram.findUnique({
      where: { id },
      include: {
        sponsor: true,
        cycles: {
          include: {
            applications: true,
            criteria: true
          },
          orderBy: {
            academicYear: 'desc'
          }
        }
      }
    });

    if (!program) {
      throw new NotFoundException(`Scholarship program with ID ${id} not found`);
    }

    return this.mapProgramToResponseDto(program);
  }

  async findCyclesByProgram(programId: string): Promise<ScholarshipResponseDto[]> {
    // First verify the program exists
    console.log(programId);

    const program = await this.prisma.scholarshipProgram.findUnique({
      where: { id: programId },
      include: { sponsor: true }
    });

    console.log(program);


    if (!program) {
      throw new NotFoundException(`Scholarship program with ID ${programId} not found`);
    }

    const cycles = await this.prisma.scholarshipCycle.findMany({
      where: { programId },
      include: {
        program: {
          include: {
            sponsor: true
          }
        },
        applications: true,
        criteria: true
      },
      orderBy: {
        academicYear: 'desc'
      }
    });

    return cycles.map(cycle => this.mapToResponseDto(cycle));
  }

  async createCycleForProgram(programId: string, createCycleDto: any): Promise<ScholarshipResponseDto> {
    // First verify the program exists
    const program = await this.prisma.scholarshipProgram.findUnique({
      where: { id: programId },
      include: { sponsor: true }
    });

    if (!program) {
      throw new NotFoundException(`Scholarship program with ID ${programId} not found`);
    }

    // Handle different field naming between DTO and test data
    const totalSlots = createCycleDto.totalSlots || createCycleDto.maxRecipients || 5;
    const availableSlots = createCycleDto.availableSlots || createCycleDto.maxRecipients || totalSlots;

    // Handle both YYYY-MM-DD and ISO date formats
    let applicationStartDate = createCycleDto.applicationStartDate || new Date();
    let applicationEndDate = createCycleDto.applicationEndDate || createCycleDto.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (typeof applicationStartDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(applicationStartDate)) {
      applicationStartDate = new Date(applicationStartDate + 'T00:00:00.000Z');
    }
    if (typeof applicationEndDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(applicationEndDate)) {
      applicationEndDate = new Date(applicationEndDate + 'T23:59:59.999Z');
    }

    // Create the cycle with the provided academic year
    const academicYear = createCycleDto.academicYear || (new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
    const displayName = createCycleDto.displayName || `${program.name} ${academicYear}`;

    const scholarship = await this.prisma.scholarshipCycle.create({
      data: {
        programId: program.id,
        academicYear: academicYear,
        displayName: displayName,
        amount: createCycleDto.amount || program.defaultAmount,
        totalSlots: totalSlots,
        availableSlots: availableSlots,
        applicationStartDate: applicationStartDate,
        applicationEndDate: applicationEndDate,
        durationMonths: 12,
        disbursementSchedule: 'SEMESTER',
        status: createCycleDto.status || 'DRAFT',
      },
      include: {
        program: {
          include: {
            sponsor: true
          }
        },
        applications: true
      }
    });

    // Create eligibility criteria if provided
    if (createCycleDto.eligibilityCriteria && Array.isArray(createCycleDto.eligibilityCriteria)) {
      for (const criteria of createCycleDto.eligibilityCriteria) {
        await this.prisma.scholarshipCycleCriteria.create({
          data: {
            cycleId: scholarship.id,
            criteriaType: 'GENERAL',
            criteriaValue: criteria,
            isMandatory: true
          }
        });
      }
    }

    // Create type criteria if provided
    if (createCycleDto.type) {
      await this.prisma.scholarshipCycleCriteria.create({
        data: {
          cycleId: scholarship.id,
          criteriaType: 'SCHOLARSHIP_TYPE',
          criteriaValue: createCycleDto.type,
          isMandatory: false
        }
      });
    }

    // Re-fetch the cycle with criteria included
    const cycleWithCriteria = await this.prisma.scholarshipCycle.findUnique({
      where: { id: scholarship.id },
      include: {
        program: {
          include: {
            sponsor: true
          }
        },
        applications: true,
        criteria: true
      }
    });

    return this.mapToResponseDto(cycleWithCriteria);
  }

  async update(id: string, updateScholarshipDto: UpdateScholarshipDto): Promise<ScholarshipResponseDto> {
    const existingScholarship = await this.prisma.scholarshipCycle.findUnique({
      where: { id },
      include: {
        program: true
      }
    });

    if (!existingScholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    const updateData: any = {};

    // Handle name update - update displayName on cycle and name on program
    if (updateScholarshipDto.name) {
      updateData.displayName = updateScholarshipDto.name;
      // Also update the program name
      await this.prisma.scholarshipProgram.update({
        where: { id: existingScholarship.programId },
        data: { name: updateScholarshipDto.name }
      });
    }

    // Handle description update - update on program
    if (updateScholarshipDto.description) {
      await this.prisma.scholarshipProgram.update({
        where: { id: existingScholarship.programId },
        data: { description: updateScholarshipDto.description }
      });
    }

    // Handle type update - store as criteria
    if (updateScholarshipDto.type) {
      // First, try to find existing type criteria
      const existingTypeCriteria = await this.prisma.scholarshipCycleCriteria.findFirst({
        where: {
          cycleId: id,
          criteriaType: 'SCHOLARSHIP_TYPE'
        }
      });

      if (existingTypeCriteria) {
        // Update existing type criteria
        await this.prisma.scholarshipCycleCriteria.update({
          where: { id: existingTypeCriteria.id },
          data: { criteriaValue: updateScholarshipDto.type }
        });
      } else {
        // Create new type criteria
        await this.prisma.scholarshipCycleCriteria.create({
          data: {
            cycleId: id,
            criteriaType: 'SCHOLARSHIP_TYPE',
            criteriaValue: updateScholarshipDto.type,
            isMandatory: false
          }
        });
      }
    }

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
        [ScholarshipStatus.OPEN]: 'OPEN',
        [ScholarshipStatus.CLOSED]: 'CLOSED',
        [ScholarshipStatus.SUSPENDED]: 'SUSPENDED',
        [ScholarshipStatus.DRAFT]: 'DRAFT'
      };
      updateData.status = statusMapping[updateScholarshipDto.status] || 'DRAFT';
    }

    const scholarship = await this.prisma.scholarshipCycle.update({
      where: { id },
      data: updateData,
      include: {
        program: {
          include: {
            sponsor: true
          }
        },
        applications: true,
        criteria: true
      }
    });

    return this.mapToResponseDto(scholarship);
  }

  async remove(id: string): Promise<void> {
    const scholarship = await this.prisma.scholarshipCycle.findUnique({
      where: { id },
      include: {
        program: {
          include: {
            sponsor: true
          }
        },
        applications: true,
        criteria: true
      }
    });

    if (!scholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    // Delete related records first to avoid foreign key constraints
    
    // Delete scholarship criteria
    await this.prisma.scholarshipCycleCriteria.deleteMany({
      where: { cycleId: id }
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
        where: { cycleId: id }
      });
    }

    // Finally delete the scholarship
    await this.prisma.scholarshipCycle.delete({
      where: { id }
    });
  }

  private mapToResponseDto(scholarship: any): ScholarshipResponseDto {
    // Map database status to frontend status
    let dynamicStatus: ScholarshipStatus;

    // Direct status mapping from database to frontend enum
    const statusMap: Record<string, ScholarshipStatus> = {
      'DRAFT': ScholarshipStatus.DRAFT,
      'OPEN': ScholarshipStatus.OPEN,
      'CLOSED': ScholarshipStatus.CLOSED,
      'SUSPENDED': ScholarshipStatus.SUSPENDED,
      'INACTIVE': ScholarshipStatus.SUSPENDED,
      'READY_FOR_LAUNCH': ScholarshipStatus.DRAFT,
      'REVIEWING': ScholarshipStatus.CLOSED,
      'COMPLETED': ScholarshipStatus.CLOSED,
      'CANCELLED': ScholarshipStatus.SUSPENDED,
      'ACTIVE': ScholarshipStatus.OPEN // Explicitly map ACTIVE to OPEN
    };

    dynamicStatus = statusMap[scholarship.status] || ScholarshipStatus.DRAFT;


    // Extract type from criteria
    const typeCriteria = scholarship.criteria?.find((c: any) => c.criteriaType === 'SCHOLARSHIP_TYPE');
    const scholarshipType = typeCriteria?.criteriaValue || ScholarshipType.FULL;

    // Filter out type criteria from eligibility criteria
    const eligibilityCriteria = scholarship.criteria?.filter((c: any) => c.criteriaType !== 'SCHOLARSHIP_TYPE').map((c: any) => c.criteriaValue) || [];

    return {
      id: scholarship.id,
      name: scholarship.displayName || scholarship.program?.name || 'Unknown Scholarship',
      description: scholarship.program?.description || '',
      amount: scholarship.amount,
      sponsor: scholarship.program?.sponsor?.name || 'Unknown Sponsor',
      type: scholarshipType,
      applicationStartDate: scholarship.applicationStartDate,
      applicationDeadline: scholarship.applicationEndDate,
      eligibilityCriteria: eligibilityCriteria,
      maxRecipients: scholarship.totalSlots,
      currentApplications: scholarship.applications?.length || 0,
      status: dynamicStatus,
      createdAt: scholarship.createdAt,
      updatedAt: scholarship.updatedAt
    };
  }

  private mapProgramToResponseDto(program: any): ScholarshipResponseDto {
    // Get the most recent or active cycle for display data
    const activeCycle = program.cycles?.find((c: any) => c.status === 'OPEN') || program.cycles?.[0];

    // Aggregate data from all cycles
    const totalApplications = program.cycles?.reduce((sum: number, cycle: any) =>
      sum + (cycle.applications?.length || 0), 0) || 0;

    // Get overall program status based on cycles
    let programStatus: string = 'DRAFT';
    if (program.cycles?.some((c: any) => c.status === 'OPEN')) {
      programStatus = 'OPEN';
    } else if (program.cycles?.some((c: any) => c.status === 'CLOSED')) {
      programStatus = 'CLOSED';
    } else if (program.cycles?.some((c: any) => c.status === 'SUSPENDED')) {
      programStatus = 'SUSPENDED';
    }

    // Map database status to frontend status
    const statusMap: Record<string, any> = {
      'DRAFT': 'DRAFT',
      'OPEN': 'OPEN',
      'CLOSED': 'CLOSED',
      'SUSPENDED': 'SUSPENDED'
    };

    // Extract type from the most recent cycle's criteria
    const typeCriteria = activeCycle?.criteria?.find((c: any) => c.criteriaType === 'SCHOLARSHIP_TYPE');
    const scholarshipType = typeCriteria?.criteriaValue || 'FULL';

    // Get eligibility criteria from the most recent cycle
    const eligibilityCriteria = activeCycle?.criteria?.filter((c: any) =>
      c.criteriaType !== 'SCHOLARSHIP_TYPE').map((c: any) => c.criteriaValue) || [];

    return {
      id: program.id,
      name: program.name,
      description: program.description || '',
      amount: program.defaultAmount,
      sponsor: program.sponsor?.name || 'Unknown Sponsor',
      type: scholarshipType,
      applicationStartDate: activeCycle?.applicationStartDate || new Date(),
      applicationDeadline: activeCycle?.applicationEndDate || new Date(),
      eligibilityCriteria: eligibilityCriteria,
      maxRecipients: program.defaultSlots,
      currentApplications: totalApplications,
      status: statusMap[programStatus] || 'DRAFT',
      createdAt: program.createdAt,
      updatedAt: program.updatedAt
    };
  }
}
