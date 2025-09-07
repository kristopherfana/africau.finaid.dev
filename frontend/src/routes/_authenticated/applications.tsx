import { createFileRoute } from '@tanstack/react-router'
import { StudentHeader } from '@/components/layout/student-header'
import { Main } from '@/components/layout/main'
import { UserApplicationsList } from '@/components/applications/user-applications-list'

export const Route = createFileRoute('/_authenticated/applications')({
  component: ApplicationsPage,
})

function ApplicationsPage() {
  return (
    <>
      <StudentHeader />
      <Main>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">My Applications</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage your scholarship applications
            </p>
          </div>
          <UserApplicationsList />
        </div>
      </Main>
    </>
  )
}