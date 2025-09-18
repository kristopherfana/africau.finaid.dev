import { createFileRoute } from '@tanstack/react-router'
import Applications from '@/features/dev-office/applications'

export const Route = createFileRoute('/_authenticated/dev-office/applications/')({
  component: Applications,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      scholarshipId: (search.scholarshipId as string) || undefined,
    }
  },
} as any)