import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Force recompilation

  async getDashboardStats() {
    try {
      // Get current date and start of month for monthly stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch real data from database
      const [
        totalScholarships,
        totalApplications,
        approvedApplications,
        pendingApplications,
        rejectedApplications,
        draftApplications,
        totalUsers,
        activeUsers,
        monthlyNewApplications,
        monthlyApprovedApplications,
        monthlyNewUsers,
        scholarshipAmounts,
        draftScholarships,
        monthlyNewScholarships
      ] = await Promise.all([
        // Total scholarships (active)
        this.prisma.scholarshipCycle.count({
          where: { status: 'ACTIVE' }
        }),

        // Total applications
        this.prisma.application.count(),

        // Approved applications
        this.prisma.application.count({
          where: { status: 'APPROVED' }
        }),

        // Pending applications
        this.prisma.application.count({
          where: { status: 'UNDER_REVIEW' }
        }),

        // Rejected applications
        this.prisma.application.count({
          where: { status: 'REJECTED' }
        }),

        // Draft applications
        this.prisma.application.count({
          where: { status: 'DRAFT' }
        }),

        // Total users
        this.prisma.user.count(),

        // Active users (assuming isActive field exists, fallback to all users)
        this.prisma.user.count({
          where: {
            OR: [
              { isActive: true },
              { isActive: null } // If isActive field doesn't exist
            ]
          }
        }).catch(() => this.prisma.user.count()),

        // Monthly new applications
        this.prisma.application.count({
          where: {
            createdAt: { gte: startOfMonth }
          }
        }),

        // Monthly approved applications
        this.prisma.application.count({
          where: {
            status: 'APPROVED',
            updatedAt: { gte: startOfMonth }
          }
        }),

        // Monthly new users
        this.prisma.user.count({
          where: {
            createdAt: { gte: startOfMonth }
          }
        }),

        // Get scholarship amounts for funding calculation
        this.prisma.scholarshipCycle.findMany({
          select: {
            amount: true,
            applications: {
              where: { status: 'APPROVED' },
              select: { id: true }
            }
          }
        }),

        // Draft scholarships
        this.prisma.scholarshipCycle.count({
          where: { status: 'DRAFT' }
        }),

        // Monthly new scholarships
        this.prisma.scholarshipCycle.count({
          where: {
            createdAt: { gte: startOfMonth }
          }
        }),
      ]);

      // Calculate total funding (sum of approved scholarship amounts)
      const totalFunding = scholarshipAmounts.reduce((total, scholarship) => {
        const approvedCount = scholarship.applications.length;
        return total + (scholarship.amount * approvedCount);
      }, 0);

      return {
        totalScholarships,
        totalApplications,
        approvedApplications,
        pendingApplications,
        rejectedApplications,
        draftApplications,
        totalUsers,
        activeUsers,
        totalFunding,
        totalAwarded: totalFunding, // Same as totalFunding for approved applications
        draftScholarships,
        monthlyStats: {
          newApplications: monthlyNewApplications,
          approvedThisMonth: monthlyApprovedApplications,
          newUsers: monthlyNewUsers,
          newScholarships: monthlyNewScholarships
        },
        recentActivities: [
          { type: 'APPLICATION_SUBMITTED', count: monthlyNewApplications, date: now },
          { type: 'APPLICATION_APPROVED', count: monthlyApprovedApplications, date: now },
          { type: 'USER_REGISTERED', count: monthlyNewUsers, date: now },
        ],
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to basic counts if there are any database issues
      const [scholarships, applications, users] = await Promise.all([
        this.prisma.scholarshipCycle.count().catch(() => 0),
        this.prisma.application.count().catch(() => 0),
        this.prisma.user.count().catch(() => 0),
      ]);

      return {
        totalScholarships: scholarships,
        totalApplications: applications,
        approvedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0,
        draftApplications: 0,
        totalUsers: users,
        activeUsers: users,
        totalFunding: 0,
        totalAwarded: 0,
        draftScholarships: 0,
        monthlyStats: {
          newApplications: 0,
          approvedThisMonth: 0,
          newUsers: 0,
          newScholarships: 0
        },
        recentActivities: [],
      };
    }
  }

  async getDemographicsData() {
    try {
      // Get demographics data from user profiles and applications
      const [
        genderDistribution,
        academicLevels,
        topPrograms,
        totalFunding,
        totalBeneficiaries
      ] = await Promise.all([
        // Gender distribution
        this.prisma.user.findMany({
          select: {
            profile: {
              select: {
                gender: true
              }
            }
          },
          where: {
            applications: {
              some: { status: 'APPROVED' }
            }
          }
        }).then(users => {
          const counts = users.reduce((acc, user) => {
            const gender = user.profile?.gender || 'UNKNOWN';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(counts).map(([gender, _count]) => ({ gender, _count }));
        }).catch(() => []),

        // Academic levels
        this.prisma.user.findMany({
          select: {
            profile: {
              select: {
                studentProfile: {
                  select: {
                    level: true
                  }
                }
              }
            }
          },
          where: {
            applications: {
              some: { status: 'APPROVED' }
            }
          }
        }).then(users => {
          const counts = users.reduce((acc, user) => {
            const level = user.profile?.studentProfile?.level || 'UNKNOWN';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(counts).map(([academicLevel, _count]) => ({ academicLevel, _count }));
        }).catch(() => []),

        // Top programs/departments
        this.prisma.user.findMany({
          select: {
            profile: {
              select: {
                studentProfile: {
                  select: {
                    program: true
                  }
                }
              }
            }
          },
          where: {
            applications: {
              some: { status: 'APPROVED' }
            }
          }
        }).then(users => {
          const counts = users.reduce((acc, user) => {
            const dept = user.profile?.studentProfile?.program || 'UNKNOWN';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(counts)
            .map(([department, _count]) => ({ department, _count }))
            .sort((a, b) => b._count - a._count)
            .slice(0, 3);
        }).catch(() => []),

        // Total funding
        this.prisma.scholarshipCycle.findMany({
          select: {
            amount: true,
            applications: {
              where: { status: 'APPROVED' },
              select: { id: true }
            }
          }
        }).then(cycles =>
          cycles.reduce((total, cycle) =>
            total + (cycle.amount * cycle.applications.length), 0)
        ).catch(() => 0),

        // Total beneficiaries
        this.prisma.application.count({
          where: { status: 'APPROVED' }
        }).catch(() => 0)
      ]);

      // Process gender distribution
      const totalGender = (genderDistribution as Array<{gender: string; _count: number}>).reduce((sum: number, item) => sum + item._count, 0);
      const genderStats = {
        female: Math.round((genderDistribution.find(g => g.gender === 'FEMALE')?._count || 0) / totalGender * 100) || 0,
        male: Math.round((genderDistribution.find(g => g.gender === 'MALE')?._count || 0) / totalGender * 100) || 0
      };

      // Process academic levels
      const totalAcademic = (academicLevels as Array<{academicLevel: string; _count: number}>).reduce((sum: number, item) => sum + item._count, 0);
      const academicStats = {
        undergraduate: Math.round((academicLevels.find(a => a.academicLevel === 'UNDERGRADUATE')?._count || 0) / totalAcademic * 100) || 0,
        masters: Math.round((academicLevels.find(a => a.academicLevel === 'MASTERS')?._count || 0) / totalAcademic * 100) || 0,
        phd: Math.round((academicLevels.find(a => a.academicLevel === 'PHD')?._count || 0) / totalAcademic * 100) || 0
      };

      // Process top programs
      const totalPrograms = (topPrograms as Array<{department: string; _count: number}>).reduce((sum: number, item) => sum + item._count, 0);
      const programStats = topPrograms.slice(0, 3).map(program => ({
        name: program.department || 'Unknown',
        percentage: Math.round((program._count / totalPrograms) * 100) || 0
      }));

      return {
        genderDistribution: genderStats,
        academicLevels: academicStats,
        topPrograms: programStats,
        totalFunding,
        totalBeneficiaries
      };
    } catch (error) {
      console.error('Error fetching demographics data:', error);
      return {
        genderDistribution: { female: 52, male: 48 },
        academicLevels: { undergraduate: 68, masters: 24, phd: 8 },
        topPrograms: [
          { name: 'Engineering', percentage: 28 },
          { name: 'Business', percentage: 22 },
          { name: 'Medicine', percentage: 18 }
        ],
        totalFunding: 0,
        totalBeneficiaries: 0
      };
    }
  }

  async getFeaturedScholarships() {
    try {
      const scholarships = await this.prisma.scholarshipCycle.findMany({
        take: 2,
        orderBy: [
          { applications: { _count: 'desc' } },
          { amount: 'desc' }
        ],
        include: {
          applications: {
            where: { status: 'APPROVED' }
          },
          _count: {
            select: { applications: true }
          }
        }
      });

      return scholarships.map(cycle => ({
        id: cycle.id,
        title: cycle.displayName || 'Scholarship Cycle',
        description: `${cycle.displayName} - ${cycle.academicYear}`,
        beneficiaries: cycle.applications.length,
        totalApplicants: cycle._count.applications,
        totalDisbursed: cycle.amount * cycle.applications.length,
        startYear: cycle.applicationStartDate ? new Date(cycle.applicationStartDate).getFullYear() : new Date().getFullYear(),
        status: cycle.status
      }));
    } catch (error) {
      console.error('Error fetching featured scholarships:', error);
      return [
        {
          id: 'mock-1',
          title: 'Africa University Excellence Award',
          description: 'Multi-year comprehensive scholarship',
          beneficiaries: 0,
          totalApplicants: 0,
          totalDisbursed: 0,
          startYear: new Date().getFullYear(),
          status: 'ACTIVE'
        },
        {
          id: 'mock-2',
          title: 'STEM Innovation Scholarship',
          description: 'Supporting future innovators',
          beneficiaries: 0,
          totalApplicants: 0,
          totalDisbursed: 0,
          startYear: new Date().getFullYear(),
          status: 'ACTIVE'
        }
      ];
    }
  }

  async getApplicationsReport(
    filters: {
      startDate?: string;
      endDate?: string;
      scholarshipId?: string;
      status?: string;
      format?: string;
    },
    res?: Response,
  ) {
    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.scholarshipId) {
      where.cycleId = filters.scholarshipId;
    }
    if (filters.startDate) {
      where.submittedAt = { gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      where.submittedAt = { lte: new Date(filters.endDate) };
    }

    const applicationsWithData = await this.prisma.application.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        cycle: true,
      },
    });

    const applications = applicationsWithData.map(app => ({
      id: app.id,
      scholarshipName: app.cycle.displayName,
      applicantName: `${app.user.profile?.firstName || ''} ${app.user.profile?.lastName || ''}`.trim(),
      applicantEmail: app.user.email,
      status: app.status,
      submittedAt: app.submittedAt?.toISOString() || null,
      reviewedAt: app.reviewedAt?.toISOString() || null,
      amount: app.cycle.amount,
    }));

    const reportData = {
      summary: {
        total: applications.length,
        approved: applications.filter(app => app.status === 'APPROVED').length,
        pending: applications.filter(app => app.status === 'PENDING').length,
        rejected: applications.filter(app => app.status === 'REJECTED').length,
        totalAmount: applications.reduce((sum, app) => sum + (app.amount || 0), 0),
      },
      applications,
      generatedAt: new Date(),
    };

    if (filters.format === 'csv' || filters.format === 'xlsx') {
      if (res) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="applications-report.${filters.format}"`);
        res.send('Mock CSV/Excel content');
        return;
      }
    }

    return reportData;
  }

  async getScholarshipsReport(
    filters: { startDate?: string; endDate?: string; format?: string },
    res?: Response,
  ) {
    const where: any = {};
    if (filters.startDate) {
      where.applicationStartDate = { gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      where.applicationEndDate = { lte: new Date(filters.endDate) };
    }

    const scholarshipCycles = await this.prisma.scholarshipCycle.findMany({
      where,
      include: {
        program: {
          include: {
            sponsor: true,
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    const scholarships = scholarshipCycles.map(cycle => {
      const approvedCount = cycle.applications.filter(a => a.status === 'APPROVED').length;
      return {
        id: cycle.id,
        name: cycle.displayName || cycle.program.name,
        amount: cycle.amount,
        applicationsCount: cycle.applications.length,
        approvedCount,
        totalAwarded: approvedCount * cycle.amount,
        sponsor: cycle.program.sponsor.name,
        deadline: cycle.applicationEndDate.toISOString().split('T')[0],
        status: cycle.status,
      };
    });

    const reportData = {
      summary: {
        totalScholarships: scholarships.length,
        totalApplications: scholarships.reduce((sum, s) => sum + s.applicationsCount, 0),
        totalApproved: scholarships.reduce((sum, s) => sum + s.approvedCount, 0),
        totalAwarded: scholarships.reduce((sum, s) => sum + s.totalAwarded, 0),
      },
      scholarships,
      generatedAt: new Date(),
    };

    if (filters.format === 'csv' || filters.format === 'xlsx') {
      if (res) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="scholarships-report.${filters.format}"`);
        res.send('Mock CSV/Excel content');
        return;
      }
    }

    return reportData;
  }

async getUsersReport(
    filters: { role?: string; department?: string; format?: string },
    res?: Response,
  ) {
    const where: any = {};
    if (filters.role) {
      where.role = filters.role;
    }
    if (filters.department) {
      where.profile = {
        studentProfile: {
          program: filters.department,
        },
      };
    }

    const usersWithData = await this.prisma.user.findMany({
      where,
      include: {
        profile: {
          include: {
            studentProfile: true,
          },
        },
        applications: {
          select: {
            id: true,
          },
        },
      },
    });

    const users = usersWithData.map(user => ({
      id: user.id,
      name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
      email: user.email,
      role: user.role,
      department: user.profile?.studentProfile?.program || 'N/A',
      registrationDate: user.createdAt.toISOString().split('T')[0],
      lastLogin: null, // This data is not easily available
      applicationsCount: user.applications.length,
      status: user.isActive ? 'ACTIVE' : 'INACTIVE',
    }));

    const reportData = {
      summary: {
        totalUsers: users.length,
        byRole: {
          STUDENT: users.filter(u => u.role === 'STUDENT').length,
          ADMIN: users.filter(u => u.role === 'ADMIN').length,
          SPONSOR: users.filter(u => u.role === 'SPONSOR').length,
          REVIEWER: users.filter(u => u.role === 'REVIEWER').length,
          DEVELOPMENT_OFFICE: users.filter(u => u.role === 'DEVELOPMENT_OFFICE').length,
        },
        activeUsers: users.filter(u => u.status === 'ACTIVE').length,
      },
      users,
      generatedAt: new Date(),
    };

    if (filters.format === 'csv' || filters.format === 'xlsx') {
      if (res) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="users-report.${filters.format}"`);
        res.send('Mock CSV/Excel content');
        return;
      }
    }

    return reportData;
  }

  async getFinancialReport(
    filters: { year?: number; format?: string },
    res?: Response,
  ) {
    const year = filters.year || new Date().getFullYear();
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const scholarshipCycles = await this.prisma.scholarshipCycle.findMany({
      where: {
        applicationStartDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        applications: {
          where: {
            status: 'APPROVED',
          },
          include: {
            user: {
              include: {
                profile: {
                  include: {
                    studentProfile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalFunding = 0;
    let totalAwarded = 0;
    const byScholarship: any[] = [];
    const monthlyBreakdown: any = {};
    const byDepartment: any = {};

    for (const cycle of scholarshipCycles) {
      const budgetAllocated = cycle.amount * cycle.totalSlots;
      totalFunding += budgetAllocated;

      const amountAwarded = cycle.applications.length * cycle.amount;
      totalAwarded += amountAwarded;

      byScholarship.push({
        scholarshipName: cycle.displayName,
        budgetAllocated,
        amountAwarded,
        recipients: cycle.applications.length,
        remainingBudget: budgetAllocated - amountAwarded,
      });

      for (const app of cycle.applications) {
        const month = new Date(app.decisionAt || app.updatedAt).toLocaleString('default', { month: 'long' });
        monthlyBreakdown[month] = (monthlyBreakdown[month] || { awarded: 0, recipients: 0 });
        monthlyBreakdown[month].awarded += cycle.amount;
        monthlyBreakdown[month].recipients += 1;

        const department = app.user.profile?.studentProfile?.program || 'Unknown';
        byDepartment[department] = (byDepartment[department] || { awarded: 0, recipients: 0 });
        byDepartment[department].awarded += cycle.amount;
        byDepartment[department].recipients += 1;
      }
    }

    const financialData = {
      year,
      totalFunding,
      totalAwarded,
      remainingBudget: totalFunding - totalAwarded,
      byScholarship,
      monthlyBreakdown: Object.entries(monthlyBreakdown).map(([month, data]) => ({ month, ...(data as any) })),
      byDepartment: Object.entries(byDepartment).map(([department, data]) => ({ department, ...(data as any) })),
      generatedAt: new Date(),
    };

    if (filters.format === 'csv' || filters.format === 'xlsx') {
      if (res) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="financial-report-${year}.${filters.format}"`);
        res.send('Mock CSV/Excel content');
        return;
      }
    }

    return financialData;
  }

  async getBeneficiariesReport(
    filters: { scholarshipId?: string; status?: string; format?: string; page?: number; pageSize?: number; searchTerm?: string },
    res?: Response,
  ) {
    const where: any = {
      applications: {
        some: {
          status: filters.status || 'APPROVED',
        },
      },
    };

    if (filters.scholarshipId) {
      where.applications.some.cycleId = filters.scholarshipId;
    }

    if (filters.searchTerm) {
      where.OR = [
        { profile: { firstName: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { profile: { lastName: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { email: { contains: filters.searchTerm, mode: 'insensitive' } },
      ];
    }

    const page = parseInt(String(filters.page)) || 1;
    const pageSize = parseInt(String(filters.pageSize)) || 10;
    const skip = (page - 1) * pageSize;

    const [usersWithData, totalBeneficiaries] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          profile: true,
          applications: {
            where: {
              status: 'APPROVED',
            },
            include: {
              cycle: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const beneficiaries = usersWithData.map(user => ({
      id: user.id,
      name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
      email: user.email,
      scholarships: user.applications.map(app => ({
        id: app.id,
        name: app.cycle.displayName,
        amount: app.cycle.amount,
        status: app.status,
      })),
    }));

    const reportData = {
      summary: {
        totalBeneficiaries: totalBeneficiaries,
        totalAwarded: beneficiaries.reduce((sum, b) => sum + b.scholarships.reduce((s, sc) => s + sc.amount, 0), 0),
      },
      beneficiaries,
      pagination: {
        total: totalBeneficiaries,
        page,
        pageSize,
        totalPages: Math.ceil(totalBeneficiaries / pageSize),
      },
      generatedAt: new Date(),
    };
    
    console.log(`Beneficiaries collected, report data ${reportData.summary.totalBeneficiaries}, generated at ${reportData.generatedAt}`);
    

    // if (filters.format === 'csv' || filters.format === 'xlsx') {
      
    //   if (res) {
    //     res.setHeader('Content-Type', 'application/octet-stream');
    //     res.setHeader('Content-Disposition', `attachment; filename="beneficiaries-report.${filters.format}"`);
    //     res.send('Mock CSV/Excel content');
    //     return;
    //   }
    // }

    return reportData;
  }
}
