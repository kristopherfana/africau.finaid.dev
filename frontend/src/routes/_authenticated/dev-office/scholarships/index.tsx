import { createFileRoute } from '@tanstack/react-router'
import ScholarshipManagement from '@/features/dev-office/scholarships'

export const Route = createFileRoute('/_authenticated/dev-office/scholarships/')({
  component: ScholarshipManagement,
})