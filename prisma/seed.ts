import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo sponsors
  const sponsor1 = await prisma.sponsor.upsert({
    where: { id: 'sponsor-1' },
    update: {},
    create: {
      id: 'sponsor-1',
      name: 'Excellence Foundation',
      type: 'ORGANIZATION',
      contactPerson: 'Dr. Sarah Mitchell',
      email: 'sarah@excellence.org',
      phone: '+263-4-123-4567',
      website: 'https://excellence.org',
      totalFunding: 50000,
      isActive: true,
    },
  })

  const sponsor2 = await prisma.sponsor.upsert({
    where: { id: 'sponsor-2' },
    update: {},
    create: {
      id: 'sponsor-2',
      name: 'Future Leaders Trust',
      type: 'ORGANIZATION',
      contactPerson: 'Mr. James Wilson',
      email: 'james@futureleaders.org',
      phone: '+263-4-765-4321',
      website: 'https://futureleaders.org',
      totalFunding: 75000,
      isActive: true,
    },
  })

  // Create demo scholarships
  const scholarship1 = await prisma.scholarship.upsert({
    where: { id: 'scholarship-1' },
    update: {},
    create: {
      id: 'scholarship-1',
      sponsorId: sponsor1.id,
      name: 'Excellence Academic Merit Scholarship',
      description: 'Supporting outstanding students with exceptional academic performance across all disciplines.',
      amount: 5000,
      currency: 'USD',
      totalSlots: 20,
      availableSlots: 20,
      applicationStartDate: new Date('2025-01-01'),
      applicationEndDate: new Date('2025-03-31'),
      academicYear: '2025-2026',
      durationMonths: 12,
      disbursementSchedule: 'SEMESTER',
      status: 'ACTIVE',
    },
  })

  const scholarship2 = await prisma.scholarship.upsert({
    where: { id: 'scholarship-2' },
    update: {},
    create: {
      id: 'scholarship-2',
      sponsorId: sponsor2.id,
      name: 'Future Leaders STEM Scholarship',
      description: 'Empowering the next generation of scientists, technologists, engineers, and mathematicians.',
      amount: 7500,
      currency: 'USD',
      totalSlots: 15,
      availableSlots: 15,
      applicationStartDate: new Date('2025-02-01'),
      applicationEndDate: new Date('2025-04-30'),
      academicYear: '2025-2026',
      durationMonths: 12,
      disbursementSchedule: 'QUARTERLY',
      status: 'ACTIVE',
    },
  })

  // Create scholarship criteria
  await prisma.scholarshipCriteria.createMany({
    data: [
      // Excellence Academic Merit Scholarship criteria
      {
        scholarshipId: scholarship1.id,
        criteriaType: 'MIN_GPA',
        criteriaValue: { value: 3.5 },
        isMandatory: true,
      },
      {
        scholarshipId: scholarship1.id,
        criteriaType: 'ACADEMIC_LEVEL',
        criteriaValue: { values: ['UNDERGRADUATE', 'MASTERS'] },
        isMandatory: true,
      },
      {
        scholarshipId: scholarship1.id,
        criteriaType: 'NATIONALITY',
        criteriaValue: { values: ['zimbabwe', 'botswana', 'zambia'] },
        isMandatory: false,
      },
      
      // Future Leaders STEM Scholarship criteria
      {
        scholarshipId: scholarship2.id,
        criteriaType: 'MIN_GPA',
        criteriaValue: { value: 3.7 },
        isMandatory: true,
      },
      {
        scholarshipId: scholarship2.id,
        criteriaType: 'ACADEMIC_LEVEL',
        criteriaValue: { values: ['UNDERGRADUATE'] },
        isMandatory: true,
      },
      {
        scholarshipId: scholarship2.id,
        criteriaType: 'PROGRAM',
        criteriaValue: { values: ['Computer Science', 'Engineering', 'Mathematics', 'Physics'] },
        isMandatory: true,
      },
      {
        scholarshipId: scholarship2.id,
        criteriaType: 'GENDER',
        criteriaValue: { value: 'FEMALE' },
        isMandatory: false,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seeding completed successfully!')
  console.log(`📊 Created:`)
  console.log(`   - 2 sponsors`)
  console.log(`   - 2 scholarships`)
  console.log(`   - 7 scholarship criteria`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })