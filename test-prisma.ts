import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const company = await prisma.company.findFirst({
      select: {
        id: true,
        customKarats: true,
      }
    })
    console.log('Successfully fetched company with customKarats:', company)
  } catch (error) {
    console.error('Error fetching company:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
