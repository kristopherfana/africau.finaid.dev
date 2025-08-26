import { createFileRoute } from '@tanstack/react-router'
import AUSignUp from '@/features/auth/au-register'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: AUSignUp,
})
