import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import AUAuthLayout from '../au-auth-layout'
import { AULoginForm } from './au-login-form'

export default function AUSignIn() {
  return (
    <AUAuthLayout>
      <Card className="border-0 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to your Africa University Scholarship Portal account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AULoginForm />
        </CardContent>
      </Card>
    </AUAuthLayout>
  )
}