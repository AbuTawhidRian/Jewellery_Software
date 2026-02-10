'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { AccountType } from '@prisma/client'

// Schema for account validation
const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
})

export type AccountFormData = z.infer<typeof accountSchema>

/**
 * Get all accounts for the current company
 */
export async function getAccounts() {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true }
  })

  if (!user?.companyId) {
    return []
  }

  const accounts = await prisma.account.findMany({
    where: { companyId: user.companyId },
    orderBy: { name: 'asc' }
  })

  return accounts
}

/**
 * Create a new account (e.g., Salary, Electricity)
 */
export async function createAccount(data: AccountFormData) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true, role: true }
  })

  if (!user?.companyId) {
    throw new Error('User must be associated with a company')
  }

  if (user.role === 'VIEWER') {
    throw new Error('Insufficient permissions')
  }

  const validated = accountSchema.parse(data)

  const account = await prisma.account.create({
    data: {
      ...validated,
      companyId: user.companyId,
    }
  })

  revalidatePath('/settings')
  return account
}

/**
 * Update an account
 */
export async function updateAccount(id: string, data: AccountFormData) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true }
  })

  if (user?.role === 'VIEWER') {
    throw new Error('Insufficient permissions')
  }

  if (!user?.companyId) {
    throw new Error('User must be associated with a company')
  }

  const validated = accountSchema.parse(data)

  const account = await prisma.account.update({
    where: {
      id,
      companyId: user.companyId
    },
    data: validated
  })

  revalidatePath('/settings')
  return account
}

/**
 * Delete an account
 */
export async function deleteAccount(id: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true }
  })

  if (!['OWNER', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) {
    throw new Error('Insufficient permissions')
  }

  if (!user?.companyId) {
    throw new Error('User must be associated with a company')
  }

  // Check if account has transactions
  const accountWithTransactions = await prisma.account.findUnique({
    where: { id },
    select: {
      _count: { select: { transactions: true } }
    }
  })

  if (accountWithTransactions && accountWithTransactions._count.transactions > 0) {
    throw new Error('Cannot delete account with existing transactions')
  }

  await prisma.account.delete({
    where: {
      id,
      companyId: user.companyId
    }
  })

  revalidatePath('/settings')
  return { success: true }
}
