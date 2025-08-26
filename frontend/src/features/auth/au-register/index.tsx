import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import AUAuthLayout from '../au-auth-layout'
import { AURegisterForm } from './au-register-form'

export default function AUSignUp() {
  return (
    <AUAuthLayout>
      <Card className="border-0 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an Account
          </CardTitle>
          <CardDescription>
            Join Africa University Scholarship Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AURegisterForm />
        </CardContent>
      </Card>
    </AUAuthLayout>
  )
}