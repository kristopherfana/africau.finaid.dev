import { createFileRoute } from '@tanstack/react-router'
import ScholarshipDetail from '@/features/dev-office/scholarships/detail'

export const Route = createFileRoute('/_authenticated/dev-office/scholarships/$id/')({
  component: ScholarshipDetail,
} as any)