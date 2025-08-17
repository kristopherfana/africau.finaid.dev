import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing Prisma queries...\n')

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  })
  console.log('Created user:', user)

  // Create a test post
  const post = await prisma.post.create({
    data: {
      title: 'Hello World',
      content: 'This is my first post!',
      authorId: user.id,
    },
  })
  console.log('Created post:', post)

  // Query all users with their posts
  const usersWithPosts = await prisma.user.findMany({
    include: {
      posts: true,
    },
  })
  console.log('\nAll users with posts:', JSON.stringify(usersWithPosts, null, 2))
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })