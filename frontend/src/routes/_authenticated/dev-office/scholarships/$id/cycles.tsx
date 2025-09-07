import { createFileRoute } from '@tanstack/react-router'
import ScholarshipCycles from '@/features/dev-office/scholarships/cycles'

export const Route = createFileRoute('/_authenticated/dev-office/scholarships/$id/cycles')({
  component: ScholarshipCycles,
})