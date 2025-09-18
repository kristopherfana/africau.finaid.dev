import { apiClient } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const useBeneficiaries = (filters: { scholarshipId?: string; status?: string; format?: string; page?: number; pageSize?: number; searchTerm?: string }) => {
  return useQuery({
    queryKey: ['beneficiaries', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.scholarshipId) params.append('scholarshipId', filters.scholarshipId);
      params.append('status', 'APPROVED');
      if (filters.format) params.append('format', filters.format);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
      return apiClient.get(`/reports/beneficiaries-report?${params.toString()}`);
    },
  });
};
