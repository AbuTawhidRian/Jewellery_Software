'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

const addStaffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ACCOUNTANT', 'PRODUCTION_STAFF', 'VIEWER', 'COMPANY_ADMIN']),
})

export async function getStaffMembers() {
  const session = await auth()
  if (!session?.user?.email) return []

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, id: true }
  })

  if (!user?.companyId) return []

  const staff = await prisma.user.findMany({
    where: {
      companyId: user.companyId,
      id: { not: user.id } // Exclude self
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return staff
}

export async function addStaffMember(data: z.infer<typeof addStaffSchema>) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true, tenantId: true }
  })

  if (!currentUser?.companyId) throw new Error('Company not found')

  // Only Owner or Company Admin can add staff
  if (currentUser.role !== 'OWNER' && currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'COMPANY_ADMIN') {
    throw new Error('Insufficient permissions')
  }

  const validated = addStaffSchema.parse(data)

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email }
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  const hashedPassword = await bcrypt.hash(validated.password, 10)

  await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email,
      passwordHash: hashedPassword,
      role: validated.role,
      companyId: currentUser.companyId,
      tenantId: currentUser.tenantId,
    }
  })

  revalidatePath('/team')
  return { success: true }
}

export async function removeStaffMember(userId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error('Unauthorized')
  
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { companyId: true, role: true }
    })
  
    if (!currentUser?.companyId) throw new Error('Company not found')
  
    // Only Owner or Company Admin can remove staff
    if (currentUser.role !== 'OWNER' && currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'COMPANY_ADMIN') {
      throw new Error('Insufficient permissions')
    }
  
    // Verify target user belongs to same company
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    if (!targetUser || targetUser.companyId !== currentUser.companyId) {
        throw new Error('User not found or not in your company')
    }

    await prisma.user.delete({
        where: { id: userId }
    })

    revalidatePath('/team')
    return { success: true }
}
