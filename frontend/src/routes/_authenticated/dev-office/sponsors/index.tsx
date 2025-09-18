import { createFileRoute } from '@tanstack/react-router'
import Sponsors from '@/features/dev-office/sponsors'

export const Route = createFileRoute('/_authenticated/dev-office/sponsors/')({
  component: Sponsors,
})