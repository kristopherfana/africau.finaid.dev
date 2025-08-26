import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateScholarshipDto, ScholarshipStatus } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { ScholarshipResponseDto } from './dto/scholarship-response.dto';

@Injectable()
export class ScholarshipsService {
  // Mock data - replace with actual database implementation
  private scholarships: ScholarshipResponseDto[] = [];

  async create(createScholarshipDto: CreateScholarshipDto): Promise<ScholarshipResponseDto> {
    const scholarship: ScholarshipResponseDto = {
      id: Math.random().toString(36).substr(2, 9),
      ...createScholarshipDto,
      status: createScholarshipDto.status || ScholarshipStatus.OPEN,
      currentApplications: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.scholarships.push(scholarship);
    return scholarship;
  }

  async findAll(filters: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ScholarshipResponseDto[]> {
    // TODO: Implement filtering and pagination
    return this.scholarships;
  }

  async findOne(id: string): Promise<ScholarshipResponseDto> {
    const scholarship = this.scholarships.find(s => s.id === id);
    if (!scholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }
    return scholarship;
  }

  async update(id: string, updateScholarshipDto: UpdateScholarshipDto): Promise<ScholarshipResponseDto> {
    const index = this.scholarships.findIndex(s => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }
    
    this.scholarships[index] = {
      ...this.scholarships[index],
      ...updateScholarshipDto,
      updatedAt: new Date(),
    };
    
    return this.scholarships[index];
  }

  async remove(id: string): Promise<void> {
    const index = this.scholarships.findIndex(s => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }
    this.scholarships.splice(index, 1);
  }
}
