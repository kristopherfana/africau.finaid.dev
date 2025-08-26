import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard statistics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
    schema: {
      example: {
        totalScholarships: 25,
        totalApplications: 350,
        approvedApplications: 45,
        pendingApplications: 120,
        totalUsers: 500,
        activeUsers: 450,
        totalFunding: 2500000,
        monthlyStats: {
          newApplications: 25,
          approvedThisMonth: 8,
        },
      },
    },
  })
  async getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('applications-report')
  @ApiOperation({ summary: 'Generate applications report' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'scholarshipId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'xlsx'], example: 'json' })
  @ApiResponse({
    status: 200,
    description: 'Applications report data',
  })
  async getApplicationsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('scholarshipId') scholarshipId?: string,
    @Query('status') status?: string,
    @Query('format') format: string = 'json',
    @Res() res?: Response,
  ) {
    return this.reportsService.getApplicationsReport({
      startDate,
      endDate,
      scholarshipId,
      status,
      format,
    }, res);
  }

  @Get('scholarships-report')
  @ApiOperation({ summary: 'Generate scholarships report' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'xlsx'] })
  @ApiResponse({
    status: 200,
    description: 'Scholarships report data',
  })
  async getScholarshipsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: string = 'json',
    @Res() res?: Response,
  ) {
    return this.reportsService.getScholarshipsReport({ startDate, endDate, format }, res);
  }

  @Get('users-report')
  @ApiOperation({ summary: 'Generate users report (admin only)' })
  @ApiQuery({ name: 'role', required: false, enum: ['STUDENT', 'ADMIN', 'SPONSOR', 'REVIEWER'] })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'xlsx'] })
  @ApiResponse({
    status: 200,
    description: 'Users report data',
  })
  async getUsersReport(
    @Query('role') role?: string,
    @Query('department') department?: string,
    @Query('format') format: string = 'json',
    @Res() res?: Response,
  ) {
    return this.reportsService.getUsersReport({ role, department, format }, res);
  }

  @Get('financial-report')
  @ApiOperation({ summary: 'Generate financial report (admin only)' })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2024 })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'xlsx'] })
  @ApiResponse({
    status: 200,
    description: 'Financial report data',
    schema: {
      example: {
        totalFunding: 2500000,
        totalAwarded: 1200000,
        remainingBudget: 1300000,
        byScholarship: [
          {
            scholarshipName: 'Excellence Scholarship',
            budgetAllocated: 500000,
            amountAwarded: 250000,
            recipients: 5,
          },
        ],
      },
    },
  })
  async getFinancialReport(
    @Query('year') year?: number,
    @Query('format') format: string = 'json',
    @Res() res?: Response,
  ) {
    return this.reportsService.getFinancialReport({ year, format }, res);
  }
}
