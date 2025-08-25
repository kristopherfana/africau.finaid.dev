import React from 'react'
import { GraduationCap, Award, Users, TrendingUp } from 'lucide-react'

export function AUShowcase() {
  return (
    <div className="au-showcase">
      {/* Hero Section with Pattern */}
      <div className="au-hero-academic text-white py-20 px-8">
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6">Africa University Scholarships</h1>
          <p className="text-xl mb-8 opacity-90">
            Empowering the next generation of African leaders through quality education
          </p>
          <button className="au-btn-primary bg-white text-red-600 hover:bg-gray-100 px-8 py-3">
            Explore Opportunities
          </button>
        </div>
      </div>

      {/* Mission/Vision/Values Style Section with Patterns */}
      <div className="au-three-column">
        <div className="au-color-block au-color-block-red relative">
          <div className="au-bg-diagonal absolute inset-0 opacity-30"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4">Our Mission</h3>
            <p className="text-sm leading-relaxed">
              To provide comprehensive scholarship opportunities that empower African students 
              to achieve academic excellence and contribute to sustainable development across the continent.
            </p>
          </div>
        </div>
        <div className="au-color-block au-color-block-white au-section-white-patterned">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Our Vision</h3>
          <p className="text-sm leading-relaxed text-gray-600">
            To become the leading scholarship management platform that bridges the gap 
            between talented students and educational opportunities in Africa.
          </p>
        </div>
        <div className="au-color-block au-color-block-black relative">
          <div className="au-bg-grid absolute inset-0 opacity-20"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4">Our Values</h3>
            <ul className="text-sm space-y-2">
              <li>• Excellence in Education</li>
              <li>• Equity and Inclusion</li>
              <li>• Innovation and Growth</li>
              <li>• Community Impact</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics Section with Texture */}
      <div className="au-stat-section au-section-gray-textured">
        <h2 className="text-3xl font-bold mb-16 text-gray-800">Scholarship Impact</h2>
        <div className="au-stat-grid">
          <div className="au-stat-item">
            <span className="au-stat-number">150+</span>
            <span className="au-stat-label">Active Scholarships</span>
          </div>
          <div className="au-stat-item">
            <span className="au-stat-number">2,500+</span>
            <span className="au-stat-label">Students Supported</span>
          </div>
          <div className="au-stat-item">
            <span className="au-stat-number">50+</span>
            <span className="au-stat-label">Partner Sponsors</span>
          </div>
          <div className="au-stat-item">
            <span className="au-stat-number">95%</span>
            <span className="au-stat-label">Success Rate</span>
          </div>
        </div>
      </div>

      {/* Feature Boxes with Patterns */}
      <div className="container mx-auto px-8 py-16 au-bg-education">
        <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">
          Why Choose Our Scholarship System
        </h2>
        <div className="au-grid au-grid-4">
          <div className="au-feature-box au-card-patterned">
            <div className="au-feature-box-icon">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-lg font-bold mb-4 text-gray-800">Academic Excellence</h3>
            <p className="text-gray-600 text-sm">
              Supporting students who demonstrate outstanding academic performance and potential.
            </p>
          </div>
          <div className="au-feature-box au-card-patterned">
            <div className="au-feature-box-icon">
              <Award size={32} />
            </div>
            <h3 className="text-lg font-bold mb-4 text-gray-800">Merit-Based Awards</h3>
            <p className="text-gray-600 text-sm">
              Fair and transparent selection process based on academic merit and need.
            </p>
          </div>
          <div className="au-feature-box au-card-patterned">
            <div className="au-feature-box-icon">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold mb-4 text-gray-800">Community Impact</h3>
            <p className="text-gray-600 text-sm">
              Developing future leaders who will contribute to their communities and continent.
            </p>
          </div>
          <div className="au-feature-box au-card-patterned">
            <div className="au-feature-box-icon">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-lg font-bold mb-4 text-gray-800">Career Growth</h3>
            <p className="text-gray-600 text-sm">
              Comprehensive support that extends beyond financial assistance to career development.
            </p>
          </div>
        </div>
      </div>

      {/* High Contrast Content Blocks with Backgrounds */}
      <div className="container mx-auto px-8 py-8">
        <div className="au-content-highlight relative">
          <div className="au-bg-geometric absolute inset-0 opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Apply Now for 2025 Scholarships</h2>
            <p className="text-lg mb-6">
              Don't miss your chance to be part of Africa University's next generation of leaders. 
              Applications are now open for our comprehensive scholarship programs.
            </p>
            <button className="au-btn-secondary bg-white text-red-600 hover:bg-gray-100">
              Start Your Application
            </button>
          </div>
        </div>

        <div className="au-content-highlight-inverse au-section-white-patterned">
          <h2 className="text-2xl font-bold mb-4">Need Help with Your Application?</h2>
          <p className="text-lg mb-6">
            Our dedicated support team is here to guide you through every step of the application process.
            Get personalized assistance and ensure your application stands out.
          </p>
          <button className="au-btn-primary">
            Contact Support
          </button>
        </div>
      </div>

      {/* Call to Action Section with Pattern */}
      <div className="au-cta-section relative">
        <div className="au-bg-dots absolute inset-0 opacity-30"></div>
        <div className="relative z-10">
          <h2>Transform Your Future with Quality Education</h2>
          <p>
            Join thousands of students who have already benefited from our scholarship programs 
            and are making a difference in their communities across Africa.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="au-btn-primary bg-red-600 hover:bg-red-700">
              Browse Scholarships
            </button>
            <button className="au-btn-secondary border-white text-white hover:bg-white hover:text-black">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Additional utility component for applying patterns to existing components
export function PatternWrapper({ 
  children, 
  pattern = 'dots',
  className = '' 
}: {
  children: React.ReactNode
  pattern?: 'dots' | 'geometric' | 'grid' | 'diagonal' | 'education'
  className?: string
}) {
  const patternClass = `au-bg-${pattern}`
  
  return (
    <div className={`relative ${className}`}>
      <div className={`absolute inset-0 ${patternClass} opacity-20 pointer-events-none`}></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}