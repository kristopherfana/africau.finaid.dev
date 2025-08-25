import { createFileRoute } from '@tanstack/react-router'
import { ApplicationForm } from '@/components/applications/application-form'

export const Route = createFileRoute('/_authenticated/scholarships/$id/apply')({
  component: ApplyPage,
})

function ApplyPage() {
  const { id } = Route.useParams()
  
  return (
    <main className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Apply for Scholarship</h1>
        <p className="text-muted-foreground mt-2">
          Complete the application form below
        </p>
      </div>
      <ApplicationForm scholarshipId={id} />
    </main>
  )
}