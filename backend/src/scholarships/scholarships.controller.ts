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
  HttpStatus 
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

@ApiTags('Scholarships')
@ApiBearerAuth()
@Controller('scholarships')
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @Post()
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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ScholarshipResponseDto[]> {
    return this.scholarshipsService.findAll({ status, type, page, limit });
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
