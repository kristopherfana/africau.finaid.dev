import { createFileRoute } from '@tanstack/react-router'
import AUSignIn from '@/features/auth/au-login'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: AUSignIn,
})
