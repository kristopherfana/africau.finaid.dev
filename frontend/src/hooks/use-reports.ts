import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '@/lib/api';

export interface ReportMetadata {
  id: string;
  name: string;
  description: string;
  type: 'FINANCIAL' | 'DEMOGRAPHIC' | 'PERFORMANCE' | 'CUSTOM';
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ON_DEMAND';
  lastGenerated: string;
  status: 'READY' | 'GENERATING' | 'SCHEDULED';
  fileSize: string;
  downloadCount: number;
}

export const reportsKeys = {
  all: ['reports'] as const,
  lists: () => [...reportsKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...reportsKeys.lists(), { filters }] as const,
  details: () => [...reportsKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportsKeys.details(), id] as const,
};

export function useFinancialReport(params?: { year?: number; format?: string }) {
  return useQuery({
    queryKey: ['financial-report', params],
    queryFn: () => reportsAPI.getFinancialReport(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useApplicationsReport(params?: {
  startDate?: string;
  endDate?: string;
  scholarshipId?: string;
  status?: string;
  format?: string;
}) {
  return useQuery({
    queryKey: ['applications-report', params],
    queryFn: () => reportsAPI.getApplicationsReport(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useScholarshipsReport(params?: {
  startDate?: string;
  endDate?: string;
  format?: string;
}) {
  return useQuery({
    queryKey: ['scholarships-report', params],
    queryFn: () => reportsAPI.getScholarshipsReport(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUsersReport(params?: {
  role?: string;
  department?: string;
  format?: string;
}) {
  return useQuery({
    queryKey: ['users-report', params],
    queryFn: () => reportsAPI.getUsersReport(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook to get available reports metadata based on real API data
export function useReportsMetadata() {
  return useQuery({
    queryKey: ['reports-metadata'],
    queryFn: async () => {
      try {
        // Try to fetch data from each report type to determine availability
        const [financialResult, dashboardResult, demographicsResult] = await Promise.allSettled([
          reportsAPI.getFinancialReport().catch(() => null),
          reportsAPI.getDashboardStats().catch(() => null),
          reportsAPI.getDemographicsData().catch(() => null)
        ]);

        const metadata: ReportMetadata[] = [];

        // Only add reports if data is available
        if (financialResult.status === 'fulfilled' && financialResult.value) {
          metadata.push({
            id: '1',
            name: 'Financial Summary Report',
            description: 'Comprehensive financial overview including funding, awards, and disbursements',
            type: 'FINANCIAL',
            frequency: 'MONTHLY',
            lastGenerated: new Date().toISOString().split('T')[0],
            status: 'READY',
            fileSize: '2.3 MB',
            downloadCount: 0
          });
        }

        if (dashboardResult.status === 'fulfilled' && dashboardResult.value &&
            dashboardResult.value.totalApplications > 0) {
          metadata.push({
            id: '2',
            name: 'Applications Analysis',
            description: 'Detailed breakdown of scholarship applications by status, program, and demographics',
            type: 'PERFORMANCE',
            frequency: 'QUARTERLY',
            lastGenerated: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            status: 'READY',
            fileSize: '4.1 MB',
            downloadCount: 0
          });
        }

        if (dashboardResult.status === 'fulfilled' && dashboardResult.value &&
            dashboardResult.value.totalScholarships > 0) {
          metadata.push({
            id: '3',
            name: 'Scholarships Performance',
            description: 'Success rates, completion rates, and impact assessment across all programs',
            type: 'PERFORMANCE',
            frequency: 'QUARTERLY',
            lastGenerated: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            status: 'READY',
            fileSize: '3.7 MB',
            downloadCount: 0
          });
        }

        if (demographicsResult.status === 'fulfilled' && demographicsResult.value &&
            demographicsResult.value.totalBeneficiaries > 0) {
          metadata.push({
            id: '4',
            name: 'Demographics Report',
            description: 'Student demographics by gender, nationality, academic level, and program distribution',
            type: 'DEMOGRAPHIC',
            frequency: 'ANNUAL',
            lastGenerated: new Date(Date.now() - 259200000).toISOString().split('T')[0],
            status: 'READY',
            fileSize: '5.2 MB',
            downloadCount: 0
          });
        }

        if (dashboardResult.status === 'fulfilled' && dashboardResult.value &&
            dashboardResult.value.totalUsers > 0) {
          metadata.push({
            id: '5',
            name: 'Users Activity Report',
            description: 'User engagement, registration trends, and platform usage statistics',
            type: 'PERFORMANCE',
            frequency: 'MONTHLY',
            lastGenerated: new Date().toISOString().split('T')[0],
            status: 'READY',
            fileSize: '1.8 MB',
            downloadCount: 0
          });
        }

        return metadata;
      } catch (error) {
        console.error('Error fetching reports metadata:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}