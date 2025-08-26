import { createFileRoute } from '@tanstack/react-router'
import { ScholarshipList } from '@/components/scholarships/scholarship-list'
import { StudentHeader } from '@/components/layout/student-header'
import { Main } from '@/components/layout/main'

export const Route = createFileRoute('/_authenticated/scholarships/')({
  component: ScholarshipsPage,
})

function ScholarshipsPage() {
  return (
    <>
      <StudentHeader />
      <Main>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Available Scholarships</h1>
            <p className="text-muted-foreground mt-2">
              Browse and apply for scholarships that match your profile
            </p>
          </div>
          <ScholarshipList />
        </div>
      </Main>
    </>
  )
}