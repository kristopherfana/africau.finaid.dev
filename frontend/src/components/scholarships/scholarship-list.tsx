import { useScholarships } from '@/hooks/use-scholarships'
import { ScholarshipCard } from './scholarship-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export function ScholarshipList() {
  const [filters, setFilters] = useState({
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
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search scholarships..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value)}>
          <SelectTrigger className="w-48">
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
          <SelectTrigger className="w-48">
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

      {/* Scholarship Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.map((scholarship) => (
          <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
        ))}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            disabled={data.pagination.page <= 1}
            onClick={() => handlePageChange(data.pagination.page - 1)}
          >
            Previous
          </Button>
          
          <span className="flex items-center px-4">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          
          <Button 
            variant="outline"
            disabled={data.pagination.page >= data.pagination.totalPages}
            onClick={() => handlePageChange(data.pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}