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
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new scholarship application' })
  @ApiResponse({
    status: 201,
    description: 'Application created successfully',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createApplicationDto: CreateApplicationDto): Promise<ApplicationResponseDto> {
    // TODO: Extract current user ID from JWT token
    // For testing, we'll look for any student user in the database
    let currentUserId = createApplicationDto.applicantId;
    
    if (!currentUserId) {
      // Find a student user for testing
      const studentUser = await this.applicationsService.findAnyStudentUser();
      currentUserId = studentUser?.id || 'current-user-id';
    }
    
    return this.applicationsService.create(createApplicationDto, currentUserId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all applications with filters (admin and students only)' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'] })
  @ApiQuery({ name: 'scholarshipId', required: false, type: String })
  @ApiQuery({ name: 'applicantId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'List of applications',
    type: [ApplicationResponseDto],
  })
  async findAll(
    @Query('status') status?: string,
    @Query('cycleId') cycleId?: string,
    @Query('applicantId') applicantId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApplicationResponseDto[]> {
    return this.applicationsService.findAll({
      status,
      cycleId,
      applicantId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('my-applications')
  @ApiOperation({ summary: 'Get current user applications' })
  @ApiResponse({
    status: 200,
    description: 'List of user applications',
    type: [ApplicationResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyApplications(): Promise<ApplicationResponseDto[]> {
    // TODO: Get user ID from JWT token/request
    const userId = 'current-user-id';
    return this.applicationsService.findByApplicant(userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get an application by ID (admin and students only)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application details',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(@Param('id') id: string): Promise<ApplicationResponseDto> {
    return this.applicationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application updated successfully',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Patch(':id/submit')
  @ApiOperation({ summary: 'Submit an application for review' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application submitted successfully',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 400, description: 'Application cannot be submitted' })
  async submit(@Param('id') id: string): Promise<ApplicationResponseDto> {
    return this.applicationsService.submit(id);
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Review an application (admin only)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application reviewed successfully',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async review(
    @Param('id') id: string,
    @Body() reviewData: { status: string; comments?: string },
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.review(id, reviewData);
  }

  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application withdrawn successfully',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async withdraw(@Param('id') id: string): Promise<ApplicationResponseDto> {
    return this.applicationsService.withdraw(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an application (admin only)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 204, description: 'Application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.applicationsService.remove(id);
  }
}
