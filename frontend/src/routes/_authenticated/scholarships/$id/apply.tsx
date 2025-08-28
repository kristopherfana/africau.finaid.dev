import { createFileRoute } from '@tanstack/react-router'
import { ApplicationForm } from '@/components/applications/application-form'
import { StudentHeader } from '@/components/layout/student-header'
import { Main } from '@/components/layout/main'
import { useScholarship } from '@/hooks/use-scholarships'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, FileText, Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/scholarships/$id/apply')({
  component: ApplyPage,
})

function ApplyPage() {
  const { id } = Route.useParams()
  const { data: scholarship, isLoading } = useScholarship(id)
  
  if (isLoading) {
    return (
      <>
        <StudentHeader />
        <Main>
          <div className="au-hero-academic min-h-[200px] flex items-center justify-center">
            <div className="text-white text-xl">Loading application form...</div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <StudentHeader />
      <Main>
        {/* AU Hero Section */}
        <div className="au-hero-academic py-12">
          <div className="container mx-auto px-6 max-w-4xl">
            <Link to={`/scholarships/${id}`}>
              <Button variant="ghost" className="mb-6 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Scholarship Details
              </Button>
            </Link>
            
            <div className="text-center text-white">
              <h1 className="au-heading-1 text-white mb-4">Apply for Scholarship</h1>
              {scholarship && (
                <p className="text-xl text-white/90 mb-6">
                  {scholarship.name}
                </p>
              )}
              <p className="au-text-lead text-white/80 max-w-2xl mx-auto">
                Complete the application form below with accurate information. 
                All fields marked with an asterisk (*) are required.
              </p>
            </div>
          </div>
        </div>

        {/* Application Guidelines Section */}
        <div className="au-section-white-patterned py-8">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="au-grid au-grid-3 mb-12">
              <div className="au-feature-box">
                <div className="au-feature-box-icon">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="au-heading-3 mb-3">Complete Information</h3>
                <p className="text-gray-600">
                  Provide accurate and complete information in all required fields.
                </p>
              </div>

              <div className="au-feature-box">
                <div className="au-feature-box-icon">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="au-heading-3 mb-3">Secure Process</h3>
                <p className="text-gray-600">
                  Your personal information is protected and handled securely.
                </p>
              </div>

              <div className="au-feature-box">
                <div className="au-feature-box-icon">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="au-heading-3 mb-3">Review & Submit</h3>
                <p className="text-gray-600">
                  Review your application carefully before final submission.
                </p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="au-content-highlight mb-8">
              <h3 className="text-xl font-bold mb-4 text-white">Important Application Guidelines</h3>
              <div className="grid md:grid-cols-2 gap-6 text-white/90">
                <div>
                  <h4 className="font-semibold mb-2">Required Documents:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Official academic transcripts</li>
                    <li>• Personal statement/essay</li>
                    <li>• Letter of recommendation (if applicable)</li>
                    <li>• Financial need documentation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Application Tips:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Save your progress regularly</li>
                    <li>• Double-check all information</li>
                    <li>• Submit before the deadline</li>
                    <li>• Keep copies of all documents</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form Section */}
        <div className="au-section-gray-textured py-12">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="au-card au-card-patterned">
              <div className="au-section-header mb-8">
                <h2 className="au-heading-2">Scholarship Application Form</h2>
                <p className="text-gray-600 mt-2">
                  Please fill out all sections completely and accurately. 
                  You can save your progress and return to complete it later.
                </p>
              </div>
              
              <ApplicationForm scholarshipId={id} />
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="au-cta-section">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <h2 className="text-white mb-4">Need Help with Your Application?</h2>
            <p className="text-white/90 mb-8">
              Our student support team is here to help you through the application process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="au-btn-secondary">
                Contact Support
              </button>
              <button className="au-btn-secondary">
                Application FAQ
              </button>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}