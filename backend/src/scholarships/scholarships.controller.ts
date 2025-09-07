import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  HttpCode,
  HttpStatus,
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';
import { ScholarshipsService } from './scholarships.service';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { ScholarshipResponseDto } from './dto/scholarship-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

@ApiTags('Scholarships')
@ApiBearerAuth()
@Controller('scholarships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @Post()
  @Roles(UserRole.DEVELOPMENT_OFFICE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new scholarship' })
  @ApiResponse({
    status: 201,
    description: 'Scholarship created successfully',
    type: ScholarshipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createScholarshipDto: CreateScholarshipDto): Promise<ScholarshipResponseDto> {
    return this.scholarshipsService.create(createScholarshipDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all scholarships' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'CLOSED', 'SUSPENDED'] })
  @ApiQuery({ name: 'type', required: false, enum: ['FULL', 'PARTIAL', 'MERIT_BASED', 'NEED_BASED'] })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'List of scholarships',
    type: [ScholarshipResponseDto],
  })
  async findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: ScholarshipResponseDto[], pagination: any }> {
    const scholarships = await this.scholarshipsService.findAll({ 
      status, 
      type, 
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined 
    });
    
    // Return paginated format for frontend, but keep service returning array for backward compatibility
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    return {
      data: scholarships,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: scholarships.length,
        totalPages: Math.ceil(scholarships.length / limitNum)
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scholarship by ID' })
  @ApiParam({ name: 'id', description: 'Scholarship ID' })
  @ApiResponse({
    status: 200,
    description: 'Scholarship details',
    type: ScholarshipResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Scholarship not found' })
  async findOne(@Param('id') id: string): Promise<ScholarshipResponseDto> {
    return this.scholarshipsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.DEVELOPMENT_OFFICE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a scholarship' })
  @ApiParam({ name: 'id', description: 'Scholarship ID' })
  @ApiResponse({
    status: 200,
    description: 'Scholarship updated successfully',
    type: ScholarshipResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Scholarship not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateScholarshipDto: UpdateScholarshipDto,
  ): Promise<ScholarshipResponseDto> {
    return this.scholarshipsService.update(id, updateScholarshipDto);
  }

  @Delete(':id')
  @Roles(UserRole.DEVELOPMENT_OFFICE, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a scholarship' })
  @ApiParam({ name: 'id', description: 'Scholarship ID' })
  @ApiResponse({ status: 204, description: 'Scholarship deleted successfully' })
  @ApiResponse({ status: 404, description: 'Scholarship not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.scholarshipsService.remove(id);
  }
}
