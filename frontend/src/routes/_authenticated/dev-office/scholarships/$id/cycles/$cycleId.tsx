import { createFileRoute } from '@tanstack/react-router'
import ScholarshipCycleDetail from '@/features/dev-office/scholarships/cycle-detail'

export const Route = createFileRoute('/_authenticated/dev-office/scholarships/$id/cycles/$cycleId')({
  component: ScholarshipCycleDetail,
})