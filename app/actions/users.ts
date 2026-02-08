'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@prisma/client'
import { hashPassword } from '@/lib/auth'

export async function getUsers() {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true, role: true }
  })

  if (!user?.tenantId) {
    throw new Error('User not found')
  }

  // OWNER can see all users in their tenant
  if (user.role === 'OWNER' || user.role === 'SUPER_ADMIN') {
    const users = await prisma.user.findMany({
      where: { tenantId: user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return users
  }

  // COMPANY_ADMIN and below can only see users in their company
  if (!user.companyId) {
    throw new Error('User does not belong to a company')
  }

  const users = await prisma.user.findMany({
    where: { companyId: user.companyId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return users
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true }
  })

  if (!currentUser?.companyId) {
    throw new Error('User does not belong to a company')
  }

  // Only Admins can update roles
  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'COMPANY_ADMIN') {
    throw new Error('Insufficient permissions')
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true }
  })

  if (targetUser?.companyId !== currentUser.companyId) {
    throw new Error('User not found in your company')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  })

  revalidatePath('/team')
  return { success: true }
}

export async function removeUser(userId: string) {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true, id: true }
  })

  if (!currentUser?.companyId) {
    throw new Error('User does not belong to a company')
  }

  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'COMPANY_ADMIN') {
    throw new Error('Insufficient permissions')
  }

  if (userId === currentUser.id) {
    throw new Error('Cannot remove yourself')
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true }
  })

  if (targetUser?.companyId !== currentUser.companyId) {
    throw new Error('User not found in your company')
  }

  // In a real app, we might soft delete or remove from company but keep the user.
  // For now, we'll delete the user record to keep it simple as per requirements.
  await prisma.user.delete({
    where: { id: userId }
  })

  revalidatePath('/team')
  return { success: true }
}

export async function inviteUser(data: { email: string; name: string; password: string; role: UserRole; companyId?: string }) {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true, role: true }
  })

  if (!currentUser?.tenantId) {
    throw new Error('User configuration error')
  }

  // Check permissions
  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'OWNER' && currentUser.role !== 'COMPANY_ADMIN') {
    throw new Error('Insufficient permissions')
  }

  // Prevent non-SUPER_ADMIN from creating SUPER_ADMIN users
  if (data.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
    throw new Error('Only platform administrators can create super admin users')
  }

  // Prevent non-OWNER from creating OWNER users  
  if (data.role === 'OWNER' && currentUser.role !== 'SUPER_ADMIN') {
    throw new Error('Only platform administrators can create owner users')
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Determine which company to assign
  let targetCompanyId: string | null = null

  if (currentUser.role === 'OWNER' || currentUser.role === 'SUPER_ADMIN') {
    // OWNER can assign to any company in their tenant
    if (data.companyId) {
      // Verify company belongs to user's tenant
      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
        select: { tenantId: true }
      })
      
      if (!company || company.tenantId !== currentUser.tenantId) {
        throw new Error('Invalid company selected')
      }
      targetCompanyId = data.companyId
    } else if (data.role !== 'OWNER') {
      // Non-OWNER users must be assigned to a company
      throw new Error('Company selection is required for non-owner users')
    }
  } else {
    // COMPANY_ADMIN can only assign to their own company
    if (!currentUser.companyId) {
      throw new Error('Company admin must belong to a company')
    }
    targetCompanyId = currentUser.companyId
  }

  // Hash the password
  const passwordHash = await hashPassword(data.password)

  // Create the new user
  await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role,
      companyId: targetCompanyId,
      tenantId: currentUser.tenantId,
      passwordHash: passwordHash,
    }
  })

  revalidatePath('/team')
  return { success: true }
}
