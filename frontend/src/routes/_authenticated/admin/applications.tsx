import { createFileRoute } from '@tanstack/react-router'
import { ApplicationsReview } from '@/components/admin/applications-review'

export const Route = createFileRoute('/_authenticated/admin/applications')({
  component: AdminApplicationsPage,
})

function AdminApplicationsPage() {
  return (
    <main className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Review Applications</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve/reject scholarship applications
        </p>
      </div>
      <ApplicationsReview />
    </main>
  )
}