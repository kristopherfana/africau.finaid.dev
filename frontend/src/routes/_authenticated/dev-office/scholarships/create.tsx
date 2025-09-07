import { createFileRoute } from '@tanstack/react-router'
import CreateScholarship from '@/features/dev-office/scholarships/create'

export const Route = createFileRoute('/_authenticated/dev-office/scholarships/create')({
  component: CreateScholarship,
})