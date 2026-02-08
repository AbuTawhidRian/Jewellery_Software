'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getCompanies() {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true, role: true }
  })

  if (!user?.tenantId) {
    throw new Error('User not found')
  }

  // Only OWNER and SUPER_ADMIN can view all companies
  if (user.role !== 'OWNER' && user.role !== 'SUPER_ADMIN') {
    throw new Error('Insufficient permissions. Only owners can manage companies.')
  }

  const companies = await prisma.company.findMany({
    where: { tenantId: user.tenantId },
    include: {
      _count: {
        select: { users: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return companies
}

export async function createCompany(data: { 
  name: string
  country: string
  currency?: string
  timezone?: string
  address?: string
  phone?: string
  email?: string
  trn?: string
}) {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true, role: true }
  })

  if (!user?.tenantId) {
    throw new Error('User not found')
  }

  // Only OWNER and SUPER_ADMIN can create companies
  if (user.role !== 'OWNER' && user.role !== 'SUPER_ADMIN') {
    throw new Error('Insufficient permissions. Only owners can create companies.')
  }

  // Check subscription limits
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId: user.tenantId }
  })

  if (subscription) {
    const currentCompanyCount = await prisma.company.count({
      where: { tenantId: user.tenantId }
    })

    if (currentCompanyCount >= subscription.maxCompanies) {
      throw new Error(`Company limit reached. Your plan allows ${subscription.maxCompanies} companies.`)
    }
  }

  const company = await prisma.company.create({
    data: {
      name: data.name,
      country: data.country,
      currency: data.currency || 'USD',
      timezone: data.timezone || 'UTC',
      address: data.address,
      phone: data.phone,
      email: data.email,
      trn: data.trn,
      tenantId: user.tenantId,
    }
  })

  revalidatePath('/companies')
  return company
}

export async function updateCompany(companyId: string, data: {
  name?: string
  country?: string
  currency?: string
  timezone?: string
  address?: string
  phone?: string
  email?: string
  trn?: string
}) {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true, role: true }
  })

  if (!user?.tenantId) {
    throw new Error('User not found')
  }

  // Only OWNER and SUPER_ADMIN can update companies
  if (user.role !== 'OWNER' && user.role !== 'SUPER_ADMIN') {
    throw new Error('Insufficient permissions')
  }

  // Verify company belongs to user's tenant
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { tenantId: true }
  })

  if (!company || company.tenantId !== user.tenantId) {
    throw new Error('Company not found')
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data
  })

  revalidatePath('/companies')
  return updatedCompany
}

export async function deleteCompany(companyId: string) {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true, role: true }
  })

  if (!user?.tenantId) {
    throw new Error('User not found')
  }

  // Only OWNER and SUPER_ADMIN can delete companies
  if (user.role !== 'OWNER' && user.role !== 'SUPER_ADMIN') {
    throw new Error('Insufficient permissions')
  }

  // Verify company belongs to user's tenant
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      tenantId: true,
      _count: {
        select: { 
          users: true,
          goldLedger: true,
          cashLedger: true,
          customers: true 
        }
      }
    }
  })

  if (!company || company.tenantId !== user.tenantId) {
    throw new Error('Company not found')
  }

  // Prevent deletion if company has data
  if (company._count.users > 0 || company._count.goldLedger > 0 || 
      company._count.cashLedger > 0 || company._count.customers > 0) {
    throw new Error('Cannot delete company with existing data. Please remove all users, transactions, and customers first.')
  }

  await prisma.company.delete({
    where: { id: companyId }
  })

  revalidatePath('/companies')
  return { success: true }
}
