import { createFileRoute } from '@tanstack/react-router'
import YearlyTracking from '@/features/dev-office/tracking'

export const Route = createFileRoute('/_authenticated/dev-office/tracking/')({
  component: YearlyTracking,
})