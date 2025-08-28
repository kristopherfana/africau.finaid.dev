import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Input } from '@/components/ui/input'
import React from 'react';
import { ScholarshipCard } from './scholarship-card'
import type { ScholarshipFilters } from '@/types/scholarship'
import { useScholarships } from '@/hooks/use-scholarships'
import { useState } from 'react'

export function ScholarshipList() {
  const [filters, setFilters] = useState<ScholarshipFilters>({
    search: '',
    category: '',
    level: '',
    page: 1,
    limit: 10
  })

  const { data, isLoading, error } = useScholarships(filters)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading scholarships...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading scholarships: {error.message}</div>
  }

  return (
    <div className="space-y-8">
      {/* Filters Section */}
      <div className="au-card">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Filter Scholarships</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search scholarships..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full"
            />
            
            <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="MERIT">Merit</SelectItem>
                <SelectItem value="NEED">Need-based</SelectItem>
                <SelectItem value="RESEARCH">Research</SelectItem>
                <SelectItem value="SPORTS">Sports</SelectItem>
                <SelectItem value="ARTS">Arts</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.level || 'all'} onValueChange={(value) => handleFilterChange('level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Study Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="UNDERGRADUATE">Undergraduate</SelectItem>
                <SelectItem value="MASTERS">Masters</SelectItem>
                <SelectItem value="PHD">PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          {data?.data.length ? `${data.data.length} Scholarships Found` : 'No Scholarships Found'}
        </h2>
        {data?.pagination && (
          <span className="text-sm text-gray-600">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1}-{Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
          </span>
        )}
      </div>

      {/* Scholarship Cards */}
      <div className="au-grid au-grid-2">
        {data?.data.map((scholarship) => (
          <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
        ))}
      </div>

      {/* Empty State */}
      {data?.data.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No scholarships found</h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
          <button 
            onClick={() => setFilters({ search: '', category: '', level: '', page: 1, limit: 10 })}
            className="au-btn-secondary px-6 py-2 rounded-md font-semibold transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button 
            disabled={data.pagination.page <= 1}
            onClick={() => handlePageChange(data.pagination.page - 1)}
            className="py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          
          <button 
            disabled={data.pagination.page >= data.pagination.totalPages}
            onClick={() => handlePageChange(data.pagination.page + 1)}
            className="py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}