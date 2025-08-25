import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApplicationService, type ApplicationFilters, type CreateApplicationData } from '@/lib/api/applications'
import { scholarshipKeys } from './use-scholarships'

// Query Keys
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters: ApplicationFilters) => [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  userApps: (userId: string) => [...applicationKeys.all, 'user', userId] as const,
  adminReview: () => [...applicationKeys.all, 'admin-review'] as const,
}

/**
 * Hook to fetch user's applications
 */
export function useUserApplications(userId: string, filters: ApplicationFilters = {}) {
  return useQuery({
    queryKey: applicationKeys.list({ ...filters, userId }),
    queryFn: () => ApplicationService.getUserApplications(userId, filters),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to fetch application details
 */
export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => ApplicationService.getApplicationById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook for applications pending admin review
 */
export function useApplicationsForReview(filters: ApplicationFilters = {}) {
  return useQuery({
    queryKey: [...applicationKeys.adminReview(), filters],
    queryFn: () => ApplicationService.getApplicationsForReview(filters),
    staleTime: 1000 * 30, // 30 seconds (more frequent updates for admin)
  })
}

/**
 * Hook for submitting new application
 */
export function useCreateApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, applicationData }: { 
      userId: string; 
      applicationData: CreateApplicationData 
    }) => ApplicationService.createApplication(userId, applicationData),
    onSuccess: (data, variables) => {
      // Invalidate user applications
      queryClient.invalidateQueries({ 
        queryKey: applicationKeys.userApps(variables.userId) 
      })
      
      // Invalidate scholarship data (to update available slots)
      queryClient.invalidateQueries({ 
        queryKey: scholarshipKeys.detail(variables.applicationData.scholarshipId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: scholarshipKeys.active() 
      })
      
      // Invalidate admin review list
      queryClient.invalidateQueries({ 
        queryKey: applicationKeys.adminReview() 
      })
    },
  })
}

/**
 * Hook for updating draft application
 */
export function useUpdateApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: Partial<CreateApplicationData> 
    }) => ApplicationService.updateApplication(id, updates),
    onSuccess: (data) => {
      // Update the specific application
      queryClient.setQueryData(applicationKeys.detail(data.id), data)
      
      // Invalidate user applications list
      queryClient.invalidateQueries({ 
        queryKey: applicationKeys.lists() 
      })
    },
  })
}

/**
 * Hook for withdrawing application
 */
export function useWithdrawApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      ApplicationService.withdrawApplication(id, userId),
    onSuccess: (data, variables) => {
      // Update the specific application
      queryClient.setQueryData(applicationKeys.detail(data.id), data)
      
      // Invalidate user applications
      queryClient.invalidateQueries({ 
        queryKey: applicationKeys.userApps(variables.userId) 
      })
    },
  })
}

/**
 * Hook for admin to update application status
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      id, 
      status, 
      adminId, 
      decisionNotes, 
      score 
    }: {
      id: string
      status: string
      adminId: string
      decisionNotes?: string
      score?: number
    }) => ApplicationService.updateApplicationStatus(id, status, adminId, decisionNotes, score),
    onSuccess: (data) => {
      // Update the specific application
      queryClient.setQueryData(applicationKeys.detail(data.id), data)
      
      // Invalidate admin review lists
      queryClient.invalidateQueries({ 
        queryKey: applicationKeys.adminReview() 
      })
      
      // Invalidate general lists
      queryClient.invalidateQueries({ 
        queryKey: applicationKeys.lists() 
      })
    },
  })
}

/**
 * Hook for real-time application updates (using Supabase subscriptions)
 */
export function useApplicationSubscription(applicationId: string) {
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: ['application-subscription', applicationId],
    queryFn: async () => {
      // Set up Supabase real-time subscription
      const { supabase } = await import('@/lib/supabase')
      
      const subscription = supabase
        .channel(`application-${applicationId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'applications',
            filter: `id=eq.${applicationId}`,
          },
          (payload) => {
            // Update the application data when it changes
            queryClient.invalidateQueries({ 
              queryKey: applicationKeys.detail(applicationId) 
            })
          }
        )
        .subscribe()
      
      return subscription
    },
    enabled: !!applicationId,
    staleTime: Infinity, // Don't refetch, just maintain subscription
  })
}