import { prisma } from './prisma'

/**
 * Generates a unique application number in the format APP2025000001
 * @returns Promise<string> - The generated application number
 */
export async function generateApplicationNumber(): Promise<string> {
  const currentYear = new Date().getFullYear()
  const prefix = `APP${currentYear}`
  
  // Get the latest application number for the current year
  const latestApplication = await prisma.application.findFirst({
    where: {
      applicationNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      applicationNumber: 'desc',
    },
  })

  let nextSequence = 1
  
  if (latestApplication) {
    // Extract the sequence number from the last application
    const lastNumber = latestApplication.applicationNumber.replace(prefix, '')
    nextSequence = parseInt(lastNumber) + 1
  }

  // Format with 6 digits padding
  const formattedSequence = nextSequence.toString().padStart(6, '0')
  
  return `${prefix}${formattedSequence}`
}