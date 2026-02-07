'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { TransactionType } from '@prisma/client'

const cashTransactionSchema = z.object({
  type: z.enum(['RECEIVE', 'PAY', 'ADJUSTMENT']),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  notes: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),

  accountId: z.string().optional().nullable(),
  date: z.date().optional(),
})

export type CashTransactionFormData = z.infer<typeof cashTransactionSchema>

/**
 * Get cash transactions for the company
 */
export async function getCashTransactions() {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true }
  })

  if (!user?.companyId) return []

  const transactions = await prisma.cashLedger.findMany({
    where: { companyId: user.companyId },
    include: {
      customer: { select: { name: true } },
      vendor: { select: { name: true } },
      account: { select: { name: true, type: true } },
    },
    orderBy: { date: 'desc' }
  })

  return transactions.map(t => ({
    ...t,
    amount: Number(t.amount)
  }))
}

/**
 * Add a cash transaction
 */
export async function createCashTransaction(data: CashTransactionFormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true }
  })

  if (!user?.companyId) throw new Error('No company context')
  if (user.role === 'VIEWER') throw new Error('Insufficient permissions')

  const validated = cashTransactionSchema.parse(data)

  const transaction = await prisma.cashLedger.create({
    data: {
      ...validated,
      companyId: user.companyId,
      date: validated.date || new Date(),
    }
  })

  revalidatePath('/cash-ledger')
  return {
    ...transaction,
    amount: Number(transaction.amount)
  }
}

/**
 * Get summary of cash
 */
export async function getCashStats() {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true }
  })

  if (!user?.companyId) return { totalIn: 0, totalOut: 0, balance: 0 }

  const transactions = await prisma.cashLedger.findMany({
    where: { companyId: user.companyId },
    select: { amount: true, type: true }
  })

  let totalIn = 0
  let totalOut = 0

  transactions.forEach(t => {
    if (t.type === 'RECEIVE') totalIn += Number(t.amount)
    else totalOut += Number(t.amount)
  })

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut
  }
}
