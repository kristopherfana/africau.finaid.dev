import { createFileRoute } from '@tanstack/react-router'
import DevOfficeDashboard from '@/features/dev-office/dashboard'

export const Route = createFileRoute('/_authenticated/dev-office/')({
  component: DevOfficeDashboard,
})