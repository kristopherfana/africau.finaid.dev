import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to seed applications for a specific cycle
async function seedCycleApplications(cycleId: string, applicationCount: number = 100, awardCount: number = 25) {
  console.log(`Seeding ${applicationCount} applications for cycle ${cycleId}...`)

  // Get random users who don't already have applications for this cycle
  const existingApplications = await prisma.application.findMany({
    where: { cycleId },
    select: { userId: true }
  })

  const existingUserIds = existingApplications.map(app => app.userId)

  const availableUsers = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      id: { notIn: existingUserIds }
    },
    include: {
      profile: {
        include: {
          studentProfile: true
        }
      }
    },
    take: applicationCount
  })

  if (availableUsers.length < applicationCount) {
    throw new Error(`Not enough available users. Found ${availableUsers.length}, need ${applicationCount}`)
  }

  const applications = []

  // Create applications
  for (let i = 0; i < applicationCount; i++) {
    const user = availableUsers[i]
    const score = Math.round((Math.random() * 35 + 60) * 100) / 100 // 60-95 range

    const application = await prisma.application.create({
      data: {
        applicationNumber: `APP-${cycleId.slice(-4)}-${String(i + 1).padStart(3, '0')}`,
        userId: user.id,
        cycleId,
        status: 'SUBMITTED',
        motivationLetter: `I am deeply committed to my studies in ${user.profile?.studentProfile?.program} and believe this scholarship will help me achieve my academic goals and contribute to Africa's development. My current GPA is ${user.profile?.studentProfile?.gpa} and I am passionate about making a positive impact in my community.`,
        score,
        submittedAt: new Date(2024, Math.floor(Math.random() * 6) + 3, Math.floor(Math.random() * 28) + 1), // Mar-Aug
        reviewedAt: new Date(2024, Math.floor(Math.random() * 3) + 9, Math.floor(Math.random() * 28) + 1)  // Sep-Nov
      }
    })

    // Create 2 reviews per application
    const reviewers = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'DEVELOPMENT_OFFICE'] } },
      take: 2
    })

    for (const reviewer of reviewers) {
      const reviewScore = score + (Math.random() - 0.5) * 10 // Slight variation
      await prisma.applicationReview.create({
        data: {
          applicationId: application.id,
          reviewerId: reviewer.id,
          score: Math.max(0, Math.min(100, reviewScore)),
          comments: reviewScore > 80 ? 'Excellent candidate with strong academic record and clear motivation' :
                   reviewScore > 70 ? 'Good candidate who meets all requirements' :
                   reviewScore > 60 ? 'Average candidate with some potential' :
                   'Below average candidate with concerns',
          recommendation: reviewScore > 75 ? 'APPROVE' : reviewScore > 65 ? 'WAITLIST' : 'REJECT'
        }
      })
    }

    applications.push({ ...application, score })
  }

  // Sort by score and award top candidates
  applications.sort((a, b) => b.score - a.score)
  const awardedApplications = applications.slice(0, awardCount)
  const rejectedApplications = applications.slice(awardCount)

  // Update approved applications
  for (const app of awardedApplications) {
    await prisma.application.update({
      where: { id: app.id },
      data: {
        status: 'APPROVED',
        decisionAt: new Date(2024, 11, 15), // December 15
        decisionBy: 'system',
        decisionNotes: 'Congratulations! You have been awarded the scholarship based on your academic excellence and potential for impact.'
      }
    })

    // Create StudentScholarship record for awarded students
    const cycle = await prisma.scholarshipCycle.findUnique({
      where: { id: cycleId },
      include: { program: true }
    })

    if (cycle) {
      await prisma.studentScholarship.create({
        data: {
          programId: cycle.programId,
          cycleId: cycle.id,
          userId: app.userId,
          firstAwardedYear: cycle.academicYear,
          maxYears: cycle.program.maxYearsPerStudent,
          totalAmountReceived: cycle.amount,
          academicStanding: 'GOOD',
          gpaRequirement: 3.0,
          lastGpaCheck: Math.random() * 1.5 + 2.5, // 2.5-4.0
          gpaCheckDate: new Date()
        }
      })
    }
  }

  // Update rejected applications
  for (const app of rejectedApplications) {
    await prisma.application.update({
      where: { id: app.id },
      data: {
        status: 'REJECTED',
        decisionAt: new Date(2024, 11, 15),
        decisionBy: 'system',
        decisionNotes: 'Unfortunately, due to limited scholarship slots and high competition, your application was not successful this time. We encourage you to apply again next year.'
      }
    })
  }

  console.log(`✅ Created ${applicationCount} applications, awarded ${awardCount}`)
  return { total: applicationCount, awarded: awardCount, rejected: rejectedApplications.length }
}

// Main function to seed specific cycle
async function main() {
  const cycleId = process.argv[2]
  const applicationCount = parseInt(process.argv[3]) || 100
  const awardCount = parseInt(process.argv[4]) || 25

  if (!cycleId) {
    console.error('Usage: npx tsx prisma/seed-applications.ts <cycleId> [applicationCount] [awardCount]')
    console.log('Example: npx tsx prisma/seed-applications.ts cycle-uuid-here 100 25')
    process.exit(1)
  }

  try {
    await seedCycleApplications(cycleId, applicationCount, awardCount)
    console.log('Applications seeded successfully!')
  } catch (error) {
    console.error('Error seeding applications:', error)
    process.exit(1)
  }
}

// Export function for use in other scripts
export { seedCycleApplications }

if (require.main === module) {
  main()
    .finally(async () => {
      await prisma.$disconnect()
    })
}