import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function AUAuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left side - Branding */}
            <div className="hidden flex-col justify-center space-y-6 rounded-lg bg-gradient-to-br from-red-600 to-red-800 p-8 text-white lg:flex">
              <div className="space-y-4">
                <img
                  src="/images/au-logo.png"
                  alt="Africa University"
                  className="h-24 w-auto"
                />
                <div>
                  <h1 className="text-3xl font-bold">Africa University</h1>
                  <p className="text-xl font-light">Scholarship Management System</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <blockquote className="border-l-4 border-white/50 pl-4 italic">
                  "Investing In Africa's Future"
                </blockquote>
                <p className="text-sm opacity-90">
                  Where leaders are made. Changing Africa, Learning Here, Leading Here, Serving God.
                </p>
              </div>

              <div className="mt-auto space-y-2">
                <p className="text-xs opacity-75">
                  Africa University is a Pan-African institution committed to fostering excellence in education and developing leaders who will transform the continent.
                </p>
              </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md space-y-4">
                {/* Mobile Logo */}
                <div className="flex flex-col items-center space-y-2 lg:hidden">
                  <img
                    src="/images/au-logo.png"
                    alt="Africa University"
                    className="h-20 w-auto"
                  />
                  <h1 className="text-xl font-bold text-red-800">Africa University</h1>
                  <p className="text-sm text-gray-600">Scholarship Management System</p>
                </div>
                
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}