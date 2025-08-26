import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ReportsService {
  async getDashboardStats() {
    // Mock data - replace with actual database queries
    return {
      totalScholarships: 25,
      totalApplications: 350,
      approvedApplications: 45,
      pendingApplications: 120,
      rejectedApplications: 85,
      draftApplications: 100,
      totalUsers: 500,
      activeUsers: 450,
      totalFunding: 2500000,
      totalAwarded: 1200000,
      monthlyStats: {
        newApplications: 25,
        approvedThisMonth: 8,
        newUsers: 15,
      },
      recentActivities: [
        { type: 'APPLICATION_SUBMITTED', count: 12, date: new Date() },
        { type: 'APPLICATION_APPROVED', count: 3, date: new Date() },
        { type: 'USER_REGISTERED', count: 8, date: new Date() },
      ],
    };
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
    // Mock data - replace with actual database queries
    const applications = [
      {
        id: '1',
        scholarshipName: 'Excellence Scholarship 2024',
        applicantName: 'John Doe',
        applicantEmail: 'john@africau.edu',
        status: 'APPROVED',
        submittedAt: '2024-01-15T10:00:00.000Z',
        reviewedAt: '2024-01-20T14:00:00.000Z',
        amount: 50000,
      },
      {
        id: '2',
        scholarshipName: 'Merit Scholarship',
        applicantName: 'Jane Smith',
        applicantEmail: 'jane@africau.edu',
        status: 'PENDING',
        submittedAt: '2024-01-18T12:00:00.000Z',
        reviewedAt: null,
        amount: 30000,
      },
      {
        id: '3',
        scholarshipName: 'Need-Based Scholarship',
        applicantName: 'Mike Johnson',
        applicantEmail: 'mike@africau.edu',
        status: 'REJECTED',
        submittedAt: '2024-01-10T09:00:00.000Z',
        reviewedAt: '2024-01-25T16:00:00.000Z',
        amount: 25000,
      },
    ];

    // Apply filters (mock implementation)
    let filtered = applications;
    
    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }
    
    if (filters.scholarshipId) {
      // In real implementation, filter by scholarship ID
      filtered = filtered.filter(app => app.id === filters.scholarshipId);
    }

    const reportData = {
      summary: {
        total: filtered.length,
        approved: filtered.filter(app => app.status === 'APPROVED').length,
        pending: filtered.filter(app => app.status === 'PENDING').length,
        rejected: filtered.filter(app => app.status === 'REJECTED').length,
        totalAmount: filtered.reduce((sum, app) => sum + app.amount, 0),
      },
      applications: filtered,
      generatedAt: new Date(),
    };

    if (filters.format === 'csv' || filters.format === 'xlsx') {
      // In real implementation, generate CSV/Excel files
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
    // Mock data - replace with actual database queries
    const scholarships = [
      {
        id: '1',
        name: 'Excellence Scholarship 2024',
        amount: 50000,
        applicationsCount: 150,
        approvedCount: 15,
        totalAwarded: 750000,
        sponsor: 'Africa University Foundation',
        deadline: '2024-06-30',
        status: 'ACTIVE',
      },
      {
        id: '2',
        name: 'Merit Scholarship',
        amount: 30000,
        applicationsCount: 120,
        approvedCount: 20,
        totalAwarded: 600000,
        sponsor: 'Academic Excellence Fund',
        deadline: '2024-08-15',
        status: 'ACTIVE',
      },
      {
        id: '3',
        name: 'Need-Based Scholarship',
        amount: 25000,
        applicationsCount: 80,
        approvedCount: 10,
        totalAwarded: 250000,
        sponsor: 'Community Support Trust',
        deadline: '2024-05-31',
        status: 'CLOSED',
      },
    ];

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
    // Mock data - replace with actual database queries
    const users = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@africau.edu',
        role: 'STUDENT',
        department: 'Computer Science',
        registrationDate: '2024-01-01',
        lastLogin: '2024-01-25',
        applicationsCount: 3,
        status: 'ACTIVE',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@africau.edu',
        role: 'STUDENT',
        department: 'Engineering',
        registrationDate: '2024-01-02',
        lastLogin: '2024-01-24',
        applicationsCount: 2,
        status: 'ACTIVE',
      },
      {
        id: '3',
        name: 'Admin User',
        email: 'admin@africau.edu',
        role: 'ADMIN',
        department: 'Administration',
        registrationDate: '2023-12-01',
        lastLogin: '2024-01-25',
        applicationsCount: 0,
        status: 'ACTIVE',
      },
    ];

    let filtered = users;
    
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }
    
    if (filters.department) {
      filtered = filtered.filter(user => user.department === filters.department);
    }

    const reportData = {
      summary: {
        totalUsers: filtered.length,
        byRole: {
          STUDENT: filtered.filter(u => u.role === 'STUDENT').length,
          ADMIN: filtered.filter(u => u.role === 'ADMIN').length,
          SPONSOR: filtered.filter(u => u.role === 'SPONSOR').length,
          REVIEWER: filtered.filter(u => u.role === 'REVIEWER').length,
        },
        activeUsers: filtered.filter(u => u.status === 'ACTIVE').length,
      },
      users: filtered,
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
    
    // Mock data - replace with actual database queries
    const financialData = {
      year,
      totalFunding: 2500000,
      totalAwarded: 1200000,
      remainingBudget: 1300000,
      byScholarship: [
        {
          scholarshipName: 'Excellence Scholarship 2024',
          budgetAllocated: 500000,
          amountAwarded: 250000,
          recipients: 5,
          remainingBudget: 250000,
        },
        {
          scholarshipName: 'Merit Scholarship',
          budgetAllocated: 600000,
          amountAwarded: 400000,
          recipients: 8,
          remainingBudget: 200000,
        },
        {
          scholarshipName: 'Need-Based Scholarship',
          budgetAllocated: 400000,
          amountAwarded: 300000,
          recipients: 6,
          remainingBudget: 100000,
        },
      ],
      monthlyBreakdown: [
        { month: 'January', awarded: 100000, recipients: 2 },
        { month: 'February', awarded: 150000, recipients: 3 },
        { month: 'March', awarded: 200000, recipients: 4 },
        // ... more months
      ],
      byDepartment: [
        { department: 'Computer Science', awarded: 400000, recipients: 8 },
        { department: 'Engineering', awarded: 500000, recipients: 10 },
        { department: 'Business', awarded: 300000, recipients: 6 },
      ],
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
}
