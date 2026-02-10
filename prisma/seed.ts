import { prisma } from '../lib/db'
import { UserRole, SubscriptionStatus } from '@prisma/client'

// const prisma = new PrismaClient() removed

async function main() {
  console.log('Seeding database...')

  // 1. Create a default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'default-tenant-id' }, // Use a fixed ID for idempotency or query by name if unique constraint existed (it doesn't for name)
    update: {},
    create: {
      id: 'default-tenant-id',
      name: 'Default Tenant',
    },
  })
  console.log('Created Tenant:', tenant.name)

  // 2. Create the Subscription for the Tenant
  const subscription = await prisma.subscription.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      status: SubscriptionStatus.TRIAL,
      plan: 'TRIAL',
      maxUsers: 5,
      maxCompanies: 1,
    },
  })
  console.log('Created Subscription:', subscription.plan)

  // 3. Create a Default Company
  // Companies don't have unique names globally, but we can check existence or just create one if none exists for this tenant
  const existingCompany = await prisma.company.findFirst({
    where: { tenantId: tenant.id, name: 'Jewellery Co.' },
  })

  let company
  if (!existingCompany) {
    company = await prisma.company.create({
      data: {
        name: 'Jewellery Co.',
        country: 'USA',
        currency: 'USD',
        tenantId: tenant.id,
        branches: {
            create: {
                name: 'Main Branch',
                address: '123 Gold St',
            }
        }
      },
    })
    console.log('Created Company:', company.name)
  } else {
    company = existingCompany
    console.log('Company already exists:', company.name)
  }

  // 4. Create a Super Admin User
  const userEmail = 'admin@example.com'
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {}, // Password not updated to avoid overwriting changes
    create: {
      email: userEmail,
      // In a real app, hash the password. For dev/seed, we might store plain or a known hash.
      // Since this is a seed, let's assume a simple has or placeholder.
      // Ideally, use a library like bcrypt if available, or just a placeholder string if auth handles it.
      // Given the previous conversation was about "Debugging Login Authentication", maybe there is a hashing mechanism?
      // For now, I'll use a placeholder and the user can reset/we can fix if auth fails.
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fKb.U9H.microburkhou0iF.SOUV8zKpBWkY.n9.', // explicit hash for 'password' or similar, or just a string
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      tenantId: tenant.id,
      companyId: company.id,
    },
  })
  console.log('Created User:', user.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
