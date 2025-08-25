import { createFileRoute } from '@tanstack/react-router'
import { UserApplications } from '@/components/applications/user-applications'

export const Route = createFileRoute('/_authenticated/applications/')({
  component: ApplicationsPage,
})

function ApplicationsPage() {
  return (
    <main className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-2">
          Track the status of your scholarship applications
        </p>
      </div>
      <UserApplications />
    </main>
  )
}