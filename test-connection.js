import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    console.log('Testing Prisma connection to Supabase...')
    
    // Test the connection
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`
    console.log('Database info:', result)
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.error('Error details:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()