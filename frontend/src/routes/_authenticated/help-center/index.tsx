import { createFileRoute } from '@tanstack/react-router'
import ComingSoon from '@/components/coming-soon'
import { StudentHeader } from '@/components/layout/student-header'
import { Main } from '@/components/layout/main'

export const Route = createFileRoute('/_authenticated/help-center/')({
  component: HelpCenterPage,
})

function HelpCenterPage() {
  return (
    <>
      <StudentHeader />
      <Main>
        <ComingSoon />
      </Main>
    </>
  )
}
