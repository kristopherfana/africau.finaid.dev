import { useQuery } from '@tanstack/react-query'
import { reportsAPI } from '@/lib/api'

export type DashboardStats = {
  totalScholarships: number
  totalApplications: number
  approvedApplications: number
  pendingApplications: number
  totalUsers: number
  activeUsers: number
  totalFunding: number
  monthlyStats: {
    newApplications: number
    approvedThisMonth: number
  }
}

export const dashboardStatsKeys = {
  all: ['dashboard-stats'] as const,
  current: () => [...dashboardStatsKeys.all, 'current'] as const,
}

/**
 * Hook to fetch dashboard statistics for the development office
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardStatsKeys.current(),
    queryFn: () => reportsAPI.getDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  })
}

/**
 * Hook to fetch demographics data for the dashboard
 */
export function useDemographicsData() {
  return useQuery({
    queryKey: ['demographics-data'],
    queryFn: () => reportsAPI.getDemographicsData(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to fetch featured scholarships for the dashboard
 */
export function useFeaturedScholarships() {
  return useQuery({
    queryKey: ['featured-scholarships'],
    queryFn: () => reportsAPI.getFeaturedScholarships(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}