import { createFileRoute } from '@tanstack/react-router'
import Demographics from '@/features/dev-office/demographics'

export const Route = createFileRoute('/_authenticated/dev-office/demographics/')({
  component: Demographics,
})