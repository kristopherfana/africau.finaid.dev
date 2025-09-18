import { createFileRoute } from '@tanstack/react-router'
import Reports from '@/features/dev-office/reports'

export const Route = createFileRoute('/_authenticated/dev-office/reports/')({
  component: Reports,
})