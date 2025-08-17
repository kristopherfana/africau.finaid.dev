import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT current_database(), current_user`
    await prisma.$disconnect()
    
    res.status(200).json({ 
      connected: true, 
      database: result[0].current_database,
      user: result[0].current_user 
    })
  } catch (error) {
    await prisma.$disconnect()
    res.status(500).json({ error: error.message })
  }
}