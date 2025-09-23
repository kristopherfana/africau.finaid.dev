import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Demographic data based on Africa University's actual demographics
const AFRICAN_COUNTRIES = [
  'Zimbabwe', 'Mozambique', 'Malawi', 'Zambia', 'South Africa',
  'Botswana', 'Namibia', 'Kenya', 'Tanzania', 'Uganda',
  'Nigeria', 'Ghana', 'Democratic Republic of Congo', 'Angola', 'Ethiopia'
]

// Weighted distribution for more realistic representation
const NATIONALITY_WEIGHTS = {
  'Zimbabwe': 0.35,        // 35% - largest group
  'Mozambique': 0.12,      // 12%
  'Malawi': 0.10,          // 10%
  'Zambia': 0.08,          // 8%
  'South Africa': 0.07,    // 7%
  'Botswana': 0.05,        // 5%
  'Namibia': 0.04,         // 4%
  'Kenya': 0.04,           // 4%
  'Tanzania': 0.04,        // 4%
  'Uganda': 0.03,          // 3%
  'Nigeria': 0.03,         // 3%
  'Ghana': 0.02,           // 2%
  'Democratic Republic of Congo': 0.02, // 2%
  'Angola': 0.01,          // 1%
  'Ethiopia': 0.01         // 1%
}

const PROGRAMS = [
  'Bachelor of Business Studies',
  'Bachelor of Computer Science',
  'Bachelor of Information Technology',
  'Bachelor of Education',
  'Bachelor of Science in Agriculture',
  'Bachelor of Science in Natural Resources',
  'Bachelor of Science in Health Services Management',
  'Bachelor of Science in Nursing',
  'Bachelor of Arts in Theology',
  'Bachelor of Arts in Religious Studies',
  'Bachelor of Arts in Economics',
  'Bachelor of Arts in English',
  'Bachelor of Arts in History',
  'Bachelor of Arts in Sociology',
  'Bachelor of Arts in International Relations',
  'Bachelor of Arts in Peace & Governance'
]

const ACADEMIC_LEVELS = ['UNDERGRADUATE', 'MASTERS']

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getWeightedNationality(): string {
  const random = Math.random()
  let cumulativeWeight = 0

  for (const [country, weight] of Object.entries(NATIONALITY_WEIGHTS)) {
    cumulativeWeight += weight
    if (random <= cumulativeWeight) {
      return country
    }
  }
  return 'Zimbabwe' // fallback
}

function getRandomGPA(): number {
  return Math.round((Math.random() * 1.5 + 2.5) * 100) / 100 // 2.5-4.0 range
}

function getRandomScore(): number {
  return Math.round((Math.random() * 35 + 60) * 100) / 100 // 60-95 range
}

// Generate cycle-specific demographics to ensure variety
function getCycleDemographics(cycleIndex: number) {
  const baseYear = 2021 + cycleIndex

  // Different demographic trends per cycle
  const cycles = {
    0: { // 2021-2022 - COVID impact, more local students
      genderRatio: { male: 0.65, female: 0.35 },
      nationalityBoost: { 'Zimbabwe': 0.15, 'Mozambique': 0.05 }, // More local
      programTrends: ['Bachelor of Computer Science', 'Bachelor of Information Technology'], // Tech boom
      ageRange: { min: 18, max: 25 }
    },
    1: { // 2022-2023 - Recovery year, more diversity
      genderRatio: { male: 0.58, female: 0.42 },
      nationalityBoost: { 'Kenya': 0.08, 'Tanzania': 0.06, 'Nigeria': 0.05 }, // East/West Africa growth
      programTrends: ['Bachelor of Business Studies', 'Bachelor of Arts in Economics'],
      ageRange: { min: 17, max: 24 }
    },
    2: { // 2023-2024 - Balanced year
      genderRatio: { male: 0.52, female: 0.48 },
      nationalityBoost: { 'South Africa': 0.08, 'Botswana': 0.06 }, // Southern Africa focus
      programTrends: ['Bachelor of Science in Agriculture', 'Bachelor of Arts in Peace & Governance'],
      ageRange: { min: 18, max: 26 }
    },
    3: { // 2024-2025 - Current year, most diverse
      genderRatio: { male: 0.48, female: 0.52 },
      nationalityBoost: { 'Ghana': 0.06, 'Uganda': 0.05, 'Ethiopia': 0.04 }, // Broader African reach
      programTrends: ['Bachelor of Science in Health Services Management', 'Bachelor of Education'],
      ageRange: { min: 17, max: 27 }
    }
  }

  return cycles[cycleIndex] || cycles[0]
}

function generateAfricanName(): { firstName: string; lastName: string } {
  const firstNames = [
    'Tendai', 'Chipo', 'Tinashe', 'Nyasha', 'Blessing', 'Gift', 'Memory', 'Precious',
    'Kemi', 'Ade', 'Chioma', 'Emeka', 'Grace', 'Hope', 'Faith', 'Peace',
    'Kwame', 'Akosua', 'Kofi', 'Ama', 'Nana', 'Abena'
  ]

  const lastNames = [
    'Mukamuri', 'Chivasa', 'Ndoro', 'Mapfumo', 'Moyo', 'Ncube', 'Sibanda',
    'Adebayo', 'Okafor', 'Nwachukwu', 'Olumide', 'Asante', 'Mensah', 'Boateng'
  ]

  return {
    firstName: getRandomElement(firstNames),
    lastName: getRandomElement(lastNames)
  }
}

async function createUsers(count: number) {
  const users = []

  for (let i = 0; i < count; i++) {
    const { firstName, lastName } = generateAfricanName()
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.africau.edu`

    const user = await prisma.user.create({
      data: {
        email,
        password: '$2b$10$dummy.hash.for.demo.purposes.only',
        role: 'STUDENT',
        profile: {
          create: {
            firstName,
            lastName,
            dateOfBirth: new Date(1995 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            gender: Math.random() > 0.4 ? 'MALE' : 'FEMALE',
            nationality: getRandomElement(AFRICAN_COUNTRIES),
            phone: `+263${Math.floor(Math.random() * 1000000000)}`,
            address: `${Math.floor(Math.random() * 999) + 1} ${getRandomElement(['Main', 'Church', 'High', 'Market'])} Street, Mutare`,
            studentProfile: {
              create: {
                studentId: `AU${String(2024000 + i).padStart(7, '0')}`,
                program: getRandomElement(PROGRAMS),
                level: getRandomElement(ACADEMIC_LEVELS),
                yearOfStudy: Math.floor(Math.random() * 4) + 1,
                gpa: getRandomGPA(),
                institution: 'Africa University',
                expectedGraduation: new Date(2025 + Math.floor(Math.random() * 3), 11, 15)
              }
            }
          }
        }
      }
    })

    users.push(user)
  }

  return users
}

async function createApplicationsForCycle(cycleId: string, users: any[], applicationCount: number, awardCount: number) {
  const selectedUsers = users.slice(0, applicationCount)
  const applications = []

  for (let i = 0; i < selectedUsers.length; i++) {
    const user = selectedUsers[i]
    const score = getRandomScore()

    const application = await prisma.application.create({
      data: {
        applicationNumber: `APP-${Date.now()}-${i}`,
        userId: user.id,
        cycleId,
        status: 'SUBMITTED',
        motivationLetter: `I am deeply committed to my studies in ${user.profile?.studentProfile?.program} and believe this scholarship will help me achieve my academic goals and contribute to Africa's development.`,
        score,
        submittedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        reviewedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      }
    })

    // Create application reviews
    await prisma.applicationReview.create({
      data: {
        applicationId: application.id,
        reviewerId: user.id, // Using same user as reviewer for demo
        score,
        comments: score > 80 ? 'Excellent candidate with strong academic record' :
                 score > 70 ? 'Good candidate, meets requirements' :
                 'Average candidate, some concerns',
        recommendation: score > 75 ? 'APPROVE' : score > 65 ? 'WAITLIST' : 'REJECT'
      }
    })

    applications.push({ ...application, score })
  }

  // Sort by score and award top candidates
  applications.sort((a, b) => b.score - a.score)
  const awardedApplications = applications.slice(0, awardCount)

  for (const app of awardedApplications) {
    await prisma.application.update({
      where: { id: app.id },
      data: {
        status: 'APPROVED',
        decisionAt: new Date(),
        decisionNotes: 'Congratulations! You have been awarded the scholarship.'
      }
    })
  }

  // Reject the rest
  for (const app of applications.slice(awardCount)) {
    await prisma.application.update({
      where: { id: app.id },
      data: {
        status: 'REJECTED',
        decisionAt: new Date(),
        decisionNotes: 'Unfortunately, due to limited slots, your application was not successful this time.'
      }
    })
  }

  return awardedApplications
}

async function main() {
  console.log('Starting seed...')

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@africau.edu',
      password: '$2b$10$dummy.hash.for.demo.purposes.only',
      role: 'DEVELOPMENT_OFFICE',
      profile: {
        create: {
          firstName: 'Development',
          lastName: 'Office',
          developmentOfficeProfile: {
            create: {
              department: 'Development Office',
              responsibleAreas: '["Scholarships", "Financial Aid"]'
            }
          }
        }
      }
    }
  })

  console.log('Created admin user')

  // Create 400 student users (for 4 cycles of 100 each)
  console.log('Creating 400 student users...')
  const users = await createUsers(400)
  console.log(`Created ${users.length} users`)

  // Note: Assuming you'll create the scholarship program and cycles manually
  // This script will work with existing cycles

  console.log('Seed completed successfully!')
  console.log('Next steps:')
  console.log('1. Create your scholarship program through the UI')
  console.log('2. Create 4 cycles for years 2021-2025')
  console.log('3. Run the application seeding for each cycle:')
  console.log('   Use createApplicationsForCycle(cycleId, users, 100, 25) in Prisma Studio or custom script')
}

// Export helper function for manual cycle seeding
export { createApplicationsForCycle }

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })