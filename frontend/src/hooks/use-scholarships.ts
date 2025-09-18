import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scholarshipsAPI, applicationsAPI } from '@/lib/api'
import type { ScholarshipFilters } from '@/types/scholarship'

// Query Keys
export const scholarshipKeys = {
  all: ['scholarships'] as const,
  lists: () => [...scholarshipKeys.all, 'list'] as const,
  list: (filters: ScholarshipFilters) => [...scholarshipKeys.lists(), filters] as const,
  details: () => [...scholarshipKeys.all, 'detail'] as const,
  detail: (id: string) => [...scholarshipKeys.details(), id] as const,
  active: () => [...scholarshipKeys.all, 'active'] as const,
}

/**
 * Hook to fetch paginated scholarships with filters
 */
export function useScholarships(filters: ScholarshipFilters = {}) {
  return useQuery({
    queryKey: scholarshipKeys.list(filters),
    queryFn: () => scholarshipsAPI.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch active scholarships
 */
export function useActiveScholarships() {
  return useQuery({
    queryKey: scholarshipKeys.active(),
    queryFn: () => scholarshipsAPI.getAll({ status: 'OPEN' }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to fetch scholarship details
 */
export function useScholarship(id: string) {
  return useQuery({
    queryKey: scholarshipKeys.detail(id),
    queryFn: () => scholarshipsAPI.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to check if user has applied for scholarship
 */
export function useHasUserApplied(scholarshipId: string, userId?: string) {
  return useQuery({
    queryKey: ['scholarships', 'application-status', scholarshipId, userId],
    queryFn: async () => {
      if (!scholarshipId || !userId) return false
      
      const applications = await applicationsAPI.getAll({ 
        scholarshipId, 
        applicantId: userId 
      })
      
      // Check if user has any application for this scholarship
      return Array.isArray(applications) && applications.length > 0
    },
    enabled: !!scholarshipId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => Boolean(data), // Ensure we always return a boolean
  })
}

/**
 * Hook for creating scholarships (Admin only)
 */
export function useCreateScholarship() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: scholarshipsAPI.create,
    onSuccess: () => {
      // Invalidate and refetch scholarship lists
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.active() })
    },
  })
}

/**
 * Hook for updating scholarships (Admin only)
 */
export function useUpdateScholarship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      scholarshipsAPI.update(id, updates),
    onSuccess: (data) => {
      // Invalidate lists and update the specific scholarship
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.active() })
      queryClient.setQueryData(scholarshipKeys.detail(data.id), data)
    },
  })
}

/**
 * Hook for deleting scholarships (Admin only)
 */
export function useDeleteScholarship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scholarshipsAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate lists and remove the specific scholarship
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.active() })
      queryClient.removeQueries({ queryKey: scholarshipKeys.detail(deletedId) })
    },
  })
}